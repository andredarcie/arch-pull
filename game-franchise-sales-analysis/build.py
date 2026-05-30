from __future__ import annotations

import csv
import json
import re
from collections import Counter
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup


SOURCE_URL = "https://en.wikipedia.org/wiki/List_of_best-selling_video_game_franchises"
PROJECT_DIR = Path(__file__).resolve().parent
DATA_DIR = PROJECT_DIR / "data"
SITE_DIR = PROJECT_DIR
CURRENT_YEAR = 2026


@dataclass(frozen=True)
class Franchise:
    rank: int
    franchise: str
    sales_millions: float
    genres: str
    debut_year: int
    publishers: str
    primary_genre: str
    decade: str
    age_years: int
    sales_per_year_millions: float


def clean_text(value: object) -> str:
    text = str(value)
    text = re.sub(r"\[[^\]]+\]", "", text)
    text = text.replace("\u200a", " ")
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s*\|\s*", "; ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip(" ;")


def parse_sales(value: object) -> float:
    text = clean_text(value)
    match = re.search(r"\d+(?:\.\d+)?", text.replace(",", ""))
    if match is None:
        raise ValueError(f"Could not parse sales from {value!r}")
    return float(match.group(0))


def parse_genres(value: object) -> str:
    text = clean_text(value)
    parts = re.split(r",|/|;", text)
    cleaned = [part.strip() for part in parts if part.strip()]
    return "; ".join(cleaned)


def parse_publishers(value: object) -> str:
    text = clean_text(value)
    text = text.replace("Nintendo/The Pokemon Company", "Nintendo; The Pokemon Company")
    text = re.sub(r"\s*/\s*", "; ", text)
    text = re.sub(r"\s*,\s*", "; ", text)
    parts = [part.strip() for part in text.split(";") if part.strip()]
    return "; ".join(parts)


def primary_genre(genres: str) -> str:
    first = genres.split(";")[0].strip()
    aliases = {
        "Action-adventure": "Action-adventure",
        "Action role-playing": "Role-playing",
        "Role-playing": "Role-playing",
        "Platform": "Platformer",
        "Platformer": "Platformer",
        "Sports": "Sports",
        "Racing": "Racing",
        "Simulation": "Simulation",
        "Puzzle": "Puzzle",
        "Fighting": "Fighting",
        "Shooter": "Shooter",
        "Strategy": "Strategy",
        "Action": "Action",
        "Adventure": "Adventure",
        "Creature collector": "Role-playing",
        "Sandbox": "Sandbox",
        "First-person shooter": "Shooter",
    }
    for prefix, normalized in aliases.items():
        if first.lower().startswith(prefix.lower()):
            return normalized
    return first or "Other"


def fetch_table_rows() -> list[dict[str, str]]:
    response = requests.get(
        SOURCE_URL,
        headers={"User-Agent": "game-franchise-sales-analysis/1.0"},
        timeout=30,
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for table in soup.find_all("table"):
        first_row = table.find("tr")
        if first_row is None:
            continue
        headers = [clean_text(header.get_text(" ", strip=True)) for header in first_row.find_all(["th", "td"])]
        if not {"Rank", "Franchise", "Sales (millions)", "Genre(s)", "Debut year", "Publisher(s)"}.issubset(headers):
            continue

        rows: list[dict[str, str]] = []
        column_headers = headers[:7]
        next_rank = 1
        for tr in table.find_all("tr")[1:]:
            cells = tr.find_all(["th", "td"])
            if len(cells) == len(column_headers):
                values = [clean_text(cell.get_text(" | ", strip=True)) for cell in cells]
            elif len(cells) == len(column_headers) - 1:
                values = [str(next_rank), *[clean_text(cell.get_text(" | ", strip=True)) for cell in cells]]
            else:
                continue
            row = {column_headers[index]: values[index] for index in range(len(column_headers))}
            rows.append(row)
            rank_text = row["Rank"]
            if rank_text.isdigit():
                next_rank = int(rank_text) + 1
        return rows
    raise RuntimeError("Could not find the franchises table in the source page.")


def build_dataset(table_rows: list[dict[str, str]]) -> list[Franchise]:
    rows: list[Franchise] = []
    for raw in table_rows:
        rank_text = clean_text(raw["Rank"])
        if not rank_text.isdigit():
            continue
        debut_year = int(clean_text(raw["Debut year"])[:4])
        sales = parse_sales(raw["Sales (millions)"])
        genres = parse_genres(raw["Genre(s)"])
        age_years = max(1, CURRENT_YEAR - debut_year + 1)
        rows.append(
            Franchise(
                rank=int(rank_text),
                franchise=clean_text(raw["Franchise"]),
                sales_millions=sales,
                genres=genres,
                debut_year=debut_year,
                publishers=parse_publishers(raw["Publisher(s)"]),
                primary_genre=primary_genre(genres),
                decade=f"{debut_year // 10 * 10}s",
                age_years=age_years,
                sales_per_year_millions=round(sales / age_years, 2),
            )
        )
    return sorted(rows, key=lambda row: row.rank)


def sum_by(rows: list[Franchise], field: str) -> list[dict[str, object]]:
    totals: Counter[str] = Counter()
    counts: Counter[str] = Counter()
    for row in rows:
        key = str(getattr(row, field))
        totals[key] += row.sales_millions
        counts[key] += 1
    return [
        {
            "name": key,
            "sales_millions": round(total, 2),
            "franchises": counts[key],
            "average_sales_millions": round(total / counts[key], 2),
        }
        for key, total in sorted(totals.items(), key=lambda item: item[1], reverse=True)
    ]


def publisher_split(rows: list[Franchise]) -> list[dict[str, object]]:
    totals: Counter[str] = Counter()
    counts: Counter[str] = Counter()
    for row in rows:
        publishers = [item.strip() for item in row.publishers.split(";") if item.strip()]
        share = row.sales_millions / max(1, len(publishers))
        for publisher in publishers:
            totals[publisher] += share
            counts[publisher] += 1
    return [
        {
            "name": key,
            "allocated_sales_millions": round(total, 2),
            "franchises": counts[key],
        }
        for key, total in sorted(totals.items(), key=lambda item: item[1], reverse=True)
    ]


def percentile(values: list[float], p: float) -> float:
    ordered = sorted(values)
    if not ordered:
        return 0
    k = (len(ordered) - 1) * p
    lower = int(k)
    upper = min(lower + 1, len(ordered) - 1)
    weight = k - lower
    return ordered[lower] * (1 - weight) + ordered[upper] * weight


def build_analysis(rows: list[Franchise]) -> dict[str, object]:
    sales = [row.sales_millions for row in rows]
    total_sales = sum(sales)
    top_5_sales = sum(row.sales_millions for row in rows[:5])
    top_10_sales = sum(row.sales_millions for row in rows[:10])
    top_20_sales = sum(row.sales_millions for row in rows[:20])
    genre_totals = sum_by(rows, "primary_genre")
    decade_totals = sum_by(rows, "decade")
    publisher_totals = publisher_split(rows)
    velocity_rows = sorted(rows, key=lambda row: row.sales_per_year_millions, reverse=True)
    oldest = sorted(rows, key=lambda row: row.debut_year)[:10]
    newest = sorted(rows, key=lambda row: row.debut_year, reverse=True)[:10]

    return {
        "source": {
            "title": "Wikipedia - List of best-selling video game franchises",
            "url": SOURCE_URL,
            "retrieved_at": datetime.now(UTC).isoformat(timespec="seconds"),
        },
        "summary": {
            "franchise_count": len(rows),
            "total_sales_millions": round(total_sales, 2),
            "median_sales_millions": round(percentile(sales, 0.5), 2),
            "p75_sales_millions": round(percentile(sales, 0.75), 2),
            "top_5_share": round(top_5_sales / total_sales, 4),
            "top_10_share": round(top_10_sales / total_sales, 4),
            "top_20_share": round(top_20_sales / total_sales, 4),
            "largest_franchise": rows[0].franchise,
            "largest_sales_millions": rows[0].sales_millions,
        },
        "topFranchises": [row.__dict__ for row in rows[:20]],
        "velocity": [row.__dict__ for row in velocity_rows[:15]],
        "genres": genre_totals,
        "decades": sorted(decade_totals, key=lambda row: row["name"]),
        "publishers": publisher_totals[:15],
        "oldest": [row.__dict__ for row in oldest],
        "newest": [row.__dict__ for row in newest],
        "allFranchises": [row.__dict__ for row in rows],
        "insights": [
            "The ranking is highly concentrated: the largest ten franchises account for a major share of all listed sales.",
            "Enduring platform, role-playing, action-adventure, and shooter franchises dominate because they combine repeated sequels with strong character or world recognition.",
            "Debut decade matters, but age alone does not explain performance. Sales velocity highlights newer franchises that reached scale faster than older catalogs.",
            "Publisher concentration is visible, but multi-publisher franchises require allocated sales rather than full attribution to every publisher.",
        ],
    }


def write_csv(rows: list[Franchise]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path = DATA_DIR / "franchises.csv"
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0].__dict__.keys()))
        writer.writeheader()
        for row in rows:
            writer.writerow(row.__dict__)


def write_json(payload: dict[str, object]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "analysis.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    table_rows = fetch_table_rows()
    rows = build_dataset(table_rows)
    if len(rows) < 40:
        raise RuntimeError(f"Unexpectedly small dataset: {len(rows)} rows")
    write_csv(rows)
    write_json(build_analysis(rows))
    print(f"Wrote {len(rows)} franchises to {DATA_DIR / 'franchises.csv'}")
    print(f"Wrote analysis to {DATA_DIR / 'analysis.json'}")


if __name__ == "__main__":
    main()
