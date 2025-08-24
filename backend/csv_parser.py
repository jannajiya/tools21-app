import csv
import io
import re
from decimal import Decimal
from typing import List, Dict


def clean_amount(value: str) -> float:
    """Convert currency-like strings to float."""
    if not value:
        return 0.0
    try:
        cleaned = re.sub(r'[^\d.-]', '', value)
        return float(Decimal(cleaned))
    except Exception:
        return 0.0


def parse_jkbank_csv(content: bytes) -> Dict:
    """
    Parses JK Bank CSV content and returns:
    {
        "basicDetails": { ... },
        "parsedData": [ ... ]
    }
    """
    try:
        decoded = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        decoded = content.decode('latin1')

    reader = csv.reader(io.StringIO(decoded))
    rows = list(reader)

    # --- Extract basic details ---
    account_holder = ""
    account_number = ""
    statement_period = ""

    try:
        if len(rows) > 1 and len(rows[1]) > 5:
            parts = rows[1][5].split('|')
            if len(parts) >= 2:
                account_number = parts[0].strip()
                account_holder = parts[1].strip()

        if len(rows) > 2 and len(rows[2]) > 5:
            period = rows[2][5].replace("To", "to")
            if "to" in period:
                statement_period = period.strip()
    except Exception as e:
        print(f"Error extracting basic details: {e}")

    # --- Locate transaction header row ---
    header_row = None
    for idx, row in enumerate(rows):
        if 'Transaction Date' in row and 'Transaction Remarks' in row:
            header_row = idx
            break
    if header_row is None:
        raise ValueError("Transaction header row not found.")

    # --- Parse transactions ---
    transactions = []
    for row in rows[header_row + 1:]:
        if len(row) < 11 or not row[3].strip():
            continue

        try:
            txn_date = row[3].strip()
            remarks = row[6].strip()
            withdrawal = clean_amount(row[7])
            deposit = clean_amount(row[8])
            balance = clean_amount(row[9])
            cheque_no = row[4].strip() if row[4].strip() != '-' else ''
            reference = row[10].strip()

            if withdrawal == 0 and deposit == 0:
                continue

            txn_type = "Payment" if withdrawal > 0 else "Receipt"
            amount = withdrawal if withdrawal > 0 else deposit

            # Narration simplification
            narration = remarks
            if "/UPI/" in remarks:
                parts = [p.strip() for p in remarks.split('/') if p.strip()]
                if len(parts) >= 4:
                    narration = f"{parts[0]} - {parts[-1]}"
            elif ":" in remarks and "Int.Pd" in remarks:
                narration = "Interest Credited"
            elif "NEFT" in remarks:
                narration = f"NEFT - {remarks.split()[-1]}"

            transactions.append({
                "date": txn_date,
                "narration": narration[:100],
                "amount": abs(amount),
                "type": txn_type,
                "cheque_no": cheque_no,
                "reference": reference,
                "balance": balance
            })

        except Exception as e:
            print(f"Skipping row due to error: {e}")
            continue

    if not transactions:
        raise ValueError("No valid transactions found.")

    # --- Derive opening and closing balances ---
    first = transactions[0]
    amt = first['amount']
    bal = first['balance']
    if first['type'].lower() == 'payment':
        opening_balance = bal + amt
    else:
        opening_balance = bal - amt

    closing_balance = transactions[-1]['balance']

    basic_details = {
        "accountHolder": account_holder,
        "accountNumber": account_number,
        "statementPeriod": statement_period,
        "openingBalance": f"{opening_balance:.2f}",
        "closingBalance": f"{closing_balance:.2f}"
    }

    return {
        "basicDetails": basic_details,
        "parsedData": transactions
    }
