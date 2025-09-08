import sqlite3
from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False
)

@app.get("/investors")
def get_investors():
    conn = sqlite3.connect("preqin.db")
    cursor = conn.cursor()
    cursor.execute("SELECT i.id, i.name, i.type, i.country, i.date_added, SUM(c.amount) FROM investor as i JOIN commitment as c on i.id = c.investor_id GROUP BY c.investor_id")
    rows = cursor.fetchall()
    investors = []
    for row in rows:
        investor = {
            'id': row[0],
            'name': row[1],
            'type': row[2],
            'country': row[3],
            'date_added': row[4],
            'commitments': row[5]
        }
        investors.append(investor)
    conn.close()
    return investors

@app.get("/investor/{investor_id}")
def get_investor(investor_id: int):
    conn = sqlite3.connect("preqin.db")
    cursor = conn.cursor()
    cursor.execute(f"SELECT id, asset_class, currency, amount FROM commitment WHERE investor_id = {investor_id}")
    rows = cursor.fetchall()
    conn.close()
    commitments = []
    for row in rows:
        commitment = {
            'id': row[0],
            'asset_class': row[1],
            'currency': row[2],
            'amount': row[3]
        }
        commitments.append(commitment)
    return {
        "investor_id": investor_id,
        "commitments": commitments
    }