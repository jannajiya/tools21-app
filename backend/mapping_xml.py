from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

def mapping_tally_xml(transactions: list, bank_ledger: str) -> str:
    envelope = Element('ENVELOPE')

    header = SubElement(envelope, 'HEADER')
    SubElement(header, 'TALLYREQUEST').text = 'Import Data'

    body = SubElement(envelope, 'BODY')
    importdata = SubElement(body, 'IMPORTDATA')
    requestdata = SubElement(importdata, 'REQUESTDATA')

    for txn in transactions:
        try:
            # Validate and format date
            if '/' not in txn['date']:
                raise ValueError("Invalid date format")
            day, month, year = txn['date'].split('/')
            date_ymd = f"{year}{month}{day}"  # Convert to YYYYMMDD

            # ✅ Safe amount parsing
            amount_raw = txn.get('amount')
            amount = float(str(amount_raw).replace(',', '').strip())
            if amount == 0:
                raise ValueError("Zero amount")

            # Validate type
            type_ = txn['type'].capitalize()
            if type_ not in ['Payment', 'Receipt']:
                raise ValueError(f"Unknown type: {type_}")

            # ✅ Create TALLYMESSAGE
            tallymessage = SubElement(requestdata, 'TALLYMESSAGE', {"xmlns:UDF": "TallyUDF"})

            voucher = SubElement(tallymessage, 'VOUCHER', {
                'VCHTYPE': type_,
                'ACTION': 'Create',
                'OBJVIEW': 'Accounting Voucher View'
            })

            SubElement(voucher, 'DATE').text = date_ymd
            SubElement(voucher, 'NARRATION').text = txn['narration'][:100]
            SubElement(voucher, 'VOUCHERTYPENAME').text = type_
            SubElement(voucher, 'PARTYLEDGERNAME').text = bank_ledger
            SubElement(voucher, 'AMOUNT').text = f"{amount:.2f}"

            # Ledger entries
            if type_ == 'Payment':
                # Debit Suspense, Credit Bank
                debit = SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
                SubElement(debit, 'LEDGERNAME').text = "Suspense"
                SubElement(debit, 'ISDEEMEDPOSITIVE').text = 'Yes'
                SubElement(debit, 'AMOUNT').text = f"-{amount:.2f}"

                credit = SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
                SubElement(credit, 'LEDGERNAME').text = bank_ledger
                SubElement(credit, 'ISDEEMEDPOSITIVE').text = 'No'
                SubElement(credit, 'AMOUNT').text = f"{amount:.2f}"
            else:
                # Debit Bank, Credit Suspense
                debit = SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
                SubElement(debit, 'LEDGERNAME').text = bank_ledger
                SubElement(debit, 'ISDEEMEDPOSITIVE').text = 'Yes'
                SubElement(debit, 'AMOUNT').text = f"-{amount:.2f}"

                credit = SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
                SubElement(credit, 'LEDGERNAME').text = "Suspense"
                SubElement(credit, 'ISDEEMEDPOSITIVE').text = 'No'
                SubElement(credit, 'AMOUNT').text = f"{amount:.2f}"

        except Exception as e:
            print(f"⚠️ Skipping transaction due to error: {e}")
            continue

    xmlstr = minidom.parseString(tostring(envelope)).toprettyxml(indent="  ")
    return xmlstr
