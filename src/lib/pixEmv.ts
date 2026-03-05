/**
 * Pix EMV QR Code payload generator (BR Code)
 * Follows BCB specification for static Pix QR Codes
 */

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function crc16CCITT(str: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }

  let crc = 0xffff;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export interface PixPayloadParams {
  chave: string;
  nomeRecebedor: string;
  cidade: string;
  valor?: string;
  descricao?: string;
  txid?: string;
}

export function generatePixPayload(params: PixPayloadParams): string {
  const { chave, nomeRecebedor, cidade, valor, descricao, txid } = params;

  // 00 - Payload Format Indicator
  let payload = tlv("00", "01");

  // 01 - Point of Initiation Method (12 = static)
  payload += tlv("01", "12");

  // 26 - Merchant Account Information
  let mai = tlv("00", "br.gov.bcb.pix"); // GUI
  mai += tlv("01", chave); // Pix key
  if (descricao && descricao.trim()) {
    mai += tlv("02", descricao.trim().substring(0, 25));
  }
  payload += tlv("26", mai);

  // 52 - Merchant Category Code
  payload += tlv("52", "0000");

  // 53 - Transaction Currency (986 = BRL)
  payload += tlv("53", "986");

  // 54 - Transaction Amount (only if provided and > 0)
  if (valor) {
    const numVal = parseFloat(valor);
    if (!isNaN(numVal) && numVal > 0) {
      payload += tlv("54", numVal.toFixed(2));
    }
  }

  // 58 - Country Code
  payload += tlv("58", "BR");

  // 59 - Merchant Name (max 25 chars, uppercase, no accents)
  const normalizedName = nomeRecebedor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 25)
    .toUpperCase();
  payload += tlv("59", normalizedName);

  // 60 - Merchant City (max 15 chars, uppercase, no accents)
  const normalizedCity = cidade
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 15)
    .toUpperCase();
  payload += tlv("60", normalizedCity);

  // 62 - Additional Data Field Template
  const txidValue = txid && txid.trim() ? txid.trim().substring(0, 25) : "***";
  const additionalData = tlv("05", txidValue);
  payload += tlv("62", additionalData);

  // 63 - CRC16 (append "6304" then compute)
  payload += "6304";
  const crc = crc16CCITT(payload);
  payload = payload.slice(0, -4) + tlv("63", crc);

  return payload;
}
