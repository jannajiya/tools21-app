 
from flask import Flask, Response, jsonify, request, send_file
from flask_cors import CORS
from csv_parser import parse_jkbank_csv
from generate_xml import generate_tally_xml
from mapping_xml import mapping_tally_xml
from gst_parser import gst_parser_bp
import tempfile
import io
import pandas as pd
import traceback

app = Flask(__name__)
app.register_blueprint(gst_parser_bp)
CORS(app)



@app.route('/parse-csv', methods=['POST'])
def parse_csv():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400

    try:
        content = file.read()
        result = parse_jkbank_csv(content)
        return jsonify({'success': True, **result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/generate-xml', methods=['POST'])
def generate_xml_from_csv():
    try:
        data = request.get_json()
        transactions = data.get('parsedData', [])
        party_ledger = data.get('partyLedger', 'Bank')

        if not transactions or not party_ledger:
            return jsonify({'success': False, 'error': 'Missing transactions or ledger name'}), 400

        xml_data = generate_tally_xml(transactions, party_ledger)

        with tempfile.NamedTemporaryFile(mode='w+', suffix='.xml', delete=False) as tmp:
            tmp.write(xml_data)
            tmp.flush()
            return send_file(tmp.name, as_attachment=True, download_name='tally_import.xml')

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/mapping-xml', methods=['POST'])
def generate_mapping_xml():
    try:
        data = request.get_json()
        transactions = data.get('transactions', [])
        bank_ledger = data.get('bank_ledger', '').strip()

        if not transactions or not bank_ledger:
            return jsonify({'error': 'Missing data or ledger name'}), 400

        xml_string = mapping_tally_xml(transactions, bank_ledger)
        buffer = io.BytesIO(xml_string.encode('utf-8'))

        return send_file(
            buffer,
            as_attachment=True,
            download_name='tally_transactions.xml',
            mimetype='application/xml'
        )

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500
    


    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files['file']
    content = uploaded_file.read().decode('utf-8', errors='ignore')
    f = io.StringIO(content)
    reader = csv.reader(f)

    all_rows = list(reader)

    # Header is at line 4 (index 3), data starts at line 6 (index 5)
    header_row_index = 3
    data_start_index = 5
    allowed_indices = {1, 2, 4, 5, 8, 9, 10, 11, 12, 13}

    try:
        headers = all_rows[header_row_index]
    except IndexError:
        return jsonify({"error": "Header row missing"}), 400

    processed = []
    for i in range(data_start_index, len(all_rows)):
        if (i - 2) not in allowed_indices:
            continue

        row = all_rows[i]
        if len(row) != len(headers):
            continue

        row_data = dict(zip(headers, row))

        rate = row_data.get("Rate (%)", "").strip()
        if not rate or rate == '-' or rate == '0':
            continue

        processed.append(row_data)

    return jsonify(processed)



    try:
        file = request.files['file']
        if not file:
            return jsonify({'error': 'No file provided'}), 400

        df = pd.read_csv(file, skiprows=2)

        # Select specific rows (1,2,4,5,8,9,10,11,12,13) => 0-indexed: 0,1,3,4,7,8,9,10,11,12
        selected_rows = [0, 1, 3, 4, 7, 8, 9, 10, 11, 12]
        df = df.iloc[selected_rows]

        if 'Rate (%)' not in df.columns:
            return jsonify({'error': "Column 'Rate (%)' not found"}), 400

        # Remove blanks or dashes and keep rows where Rate > 0
        df = df[df['Rate (%)'].apply(lambda x: pd.to_numeric(x, errors='coerce')) > 0]

        # Clean data
        df.fillna('', inplace=True)
        data = df.to_dict(orient='records')
        return jsonify(data), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

    
if __name__ == '__main__': 
    app.run(debug=True)

