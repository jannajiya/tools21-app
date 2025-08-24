from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

def generate_tally_xml(transactions: list, bank_ledger: str) -> str:
    envelope = Element('ENVELOPE')
    header = SubElement(envelope, 'HEADER')
    SubElement(header, 'TALLYREQUEST').text = 'Import Data'
    body = SubElement(envelope, 'BODY')
    importdata = SubElement(body, 'IMPORTDATA')
    requestdata = SubElement(importdata, 'REQUESTDATA')
    tallymessage = SubElement(requestdata, 'TALLYMESSAGE')

    for txn in transactions:
        try:
            if '/' not in txn['date']:
                raise ValueError("Invalid date format")

            day, month, year = txn['date'].split('/')
            date_ymd = f"{year}{month}{day}"

            voucher = SubElement(tallymessage, 'VOUCHER', {
                'VCHTYPE': txn['type'],
                'ACTION': 'Create',
                'OBJVIEW': 'Accounting Voucher View'
            })

            SubElement(voucher, 'DATE').text = date_ymd
            SubElement(voucher, 'NARRATION').text = txn['narration'][:100]
            SubElement(voucher, 'VOUCHERTYPENAME').text = txn['type']
            SubElement(voucher, 'PARTYLEDGERNAME').text = bank_ledger

            amount_str = f"{abs(txn['amount']):.2f}"

            if txn['type'] == 'Payment':
                debit = SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
                SubElement(debit, 'LEDGERNAME').text = "Suspense"
                SubElement(debit, 'ISDEEMEDPOSITIVE').text = 'Yes'
                SubElement(debit, 'AMOUNT').text = f"-{amount_str}"

                credit = SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
                SubElement(credit, 'LEDGERNAME').text = bank_ledger
                SubElement(credit, 'ISDEEMEDPOSITIVE').text = 'No'
                SubElement(credit, 'AMOUNT').text = amount_str
            else:  # Receipt
                debit = SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
                SubElement(debit, 'LEDGERNAME').text = bank_ledger
                SubElement(debit, 'ISDEEMEDPOSITIVE').text = 'Yes'
                SubElement(debit, 'AMOUNT').text = f"-{amount_str}"

                credit = SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
                SubElement(credit, 'LEDGERNAME').text = "Suspense"
                SubElement(credit, 'ISDEEMEDPOSITIVE').text = 'No'
                SubElement(credit, 'AMOUNT').text = amount_str

        except Exception as e:
            print(f"Skipping transaction: {e}")
            continue

    xmlstr = minidom.parseString(tostring(envelope)).toprettyxml(indent="  ")
    return xmlstr
