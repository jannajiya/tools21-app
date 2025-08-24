from flask import Blueprint, request, jsonify
import csv
import io

gst_parser_bp = Blueprint('gst_parser', __name__)

@gst_parser_bp.route('/parse-gstr2a', methods=['POST'])
def parse_gstr2a():
    files = request.files.getlist('files') or [request.files.get('file')]
    if not files or not any(f and f.filename.endswith('.csv') for f in files):
        return jsonify({'error': 'No valid CSV files uploaded'}), 400

    field_aliases = {
        'GSTIN of supplier': ['GSTIN of supplier'],
        'Invoice Number': ['Invoice Number', 'Invoice No.', 'Inv No'],
        'Invoice date': ['Invoice date', 'Inv Date', 'Invoice Dt.'],
        'Taxable Value': ['Taxable Value'],
        'Rate (%)': ['Rate (%)', 'Rate'],
        'Integrated Tax Amount': ['Integrated Tax', 'IGST Amount'],
        'Central Tax Amount': ['Central Tax', 'CGST Amount'],
        'State/UT Tax Amount': ['State/UT Tax', 'SGST Amount'],
        'Cess Amount': ['Cess Amount', 'Cess']
    }

    numeric_fields = [
        'Taxable Value',
        'Integrated Tax Amount',
        'Central Tax Amount',
        'State/UT Tax Amount',
        'Cess Amount'
    ]

    combined_preview = []
    reference_rows = []

    for file in files:
        if not file or not file.filename.endswith('.csv'):
            continue
        try:
            stream = io.StringIO(file.stream.read().decode("utf-8"))
            reader = list(csv.reader(stream))

            if len(reader) <= 3:
                continue

            raw_headers = reader[2]
            actual_header_map = {}
            for required, aliases in field_aliases.items():
                for idx, h in enumerate(raw_headers):
                    clean = h.strip().lower()
                    if any(alias.lower() == clean for alias in aliases):
                        actual_header_map[required] = idx
                        break

            file_refs = [' | '.join(row) for i, row in enumerate(reader) if i in [0, 1, 3, 4, 5, 6]]
            reference_rows.extend(file_refs)

            for row in reader[3:]:
                if not any(row):
                    continue

                row_dict = {}
                for required_field, idx in actual_header_map.items():
                    value = row[idx].strip() if idx < len(row) else ''
                    if required_field in numeric_fields:
                        try:
                            num = float(value.replace(',', '').replace('₹', '').strip())
                            value = f"{num:,.2f}"
                        except Exception:
                            value = value or ''
                    row_dict[required_field] = value

                try:
                    rate = float(row_dict.get('Rate (%)', '0').replace('%', '').strip() or '0')
                    taxable_val = row_dict.get('Taxable Value', '').replace(',', '').strip()
                    if rate > 0 and taxable_val and taxable_val != '-':
                        combined_preview.append(row_dict)
                except Exception:
                    continue

        except Exception as e:
            return jsonify({'error': f'Error in file {file.filename}: {str(e)}'}), 500

    if not combined_preview:
        return jsonify({'error': 'No valid rows found in uploaded files.'}), 400

    return jsonify({
        'preview': combined_preview,
        'columns': list(field_aliases.keys()),
        'reference_rows': reference_rows,
        'count': len(combined_preview)
    })
