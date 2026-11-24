# CSV Filter CLI

A command-line utility that filters a CSV file by minimum age and city. It uses Node.js built-in modules only and reads input incrementally through a Readable stream.

## Requirements

- Node.js 18 or newer

## Setup

Copy `.env.example` to `.env` and adjust the paths or filter values if needed:

```env
INPUT_FILE=data/users.csv
OUTPUT_FILE=data/result.csv
MIN_AGE=18
CITY_FILTER=Moscow
```

Paths are resolved relative to the project directory. The input CSV must have `age` and `city` columns; its header is preserved in the output.

## Run

```sh
npm start
```

The CLI prints the number of processed rows, matched rows, and filtered out rows. If the input file is missing or invalid, it prints an error and exits with a non-zero status.