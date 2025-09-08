
import pandas as pd
import sqlite3

def convert_csv_to_db(csv_file, db_file):
    df = pd.read_csv(csv_file)

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS investor (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            type TEXT,
            country TEXT,
            date_added TEXT,
            last_updated TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS commitment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            investor_id INTEGER,
            asset_class TEXT,
            amount INTEGER,
            currency TEXT,
            FOREIGN KEY (investor_id) REFERENCES investor(id)
        )
    """)

    investors = df[['Investor Name', 'Investory Type', 'Investor Country', 'Investor Date Added', 'Investor Last Updated']].drop_duplicates().reset_index(drop=True)
    investor_id_map = {}
    for index, row in investors.iterrows():
        cursor.execute("""
            INSERT INTO investor (name, type, country, date_added, last_updated)
            VALUES (?, ?, ?, ?, ?)
        """, (row['Investor Name'], row['Investory Type'], row['Investor Country'], row['Investor Date Added'], row['Investor Last Updated']))
        investor_id_map[row['Investor Name']] = cursor.lastrowid

    for index, row in df.iterrows():
        investor_id = investor_id_map[row['Investor Name']]
        cursor.execute("""
            INSERT INTO commitment (investor_id, asset_class, amount, currency)
            VALUES (?, ?, ?, ?)
        """, (investor_id, row['Commitment Asset Class'], row['Commitment Amount'], row['Commitment Currency']))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    csv_file_path = "backend/data.csv"
    db_file_path = "backend/preqin.db"
    convert_csv_to_db(csv_file_path, db_file_path)
    print(f"Database created at {db_file_path} from {csv_file_path}")
