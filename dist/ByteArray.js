"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ByteArray = (function () {
    function ByteArray(buffer) {
        this.$setArrayBuffer(buffer || new ArrayBuffer(0));
        this.endian = Endian.BIG_ENDIAN;
    }
    Object.defineProperty(ByteArray.prototype, "buffer", {
        get: function () { return this._data.buffer; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "data", {
        get: function () { return this._data; },
        set: function (value) {
            this._data = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "bufferOffset", {
        get: function () { return this._data.byteOffset; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "position", {
        get: function () { return this._position; },
        set: function (value) {
            this._position = Math.max(0, Math.min(value, this.length));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "length", {
        get: function () {
            return this._data.byteLength;
        },
        set: function (value) {
            if (this.length == value)
                return;
            var tmp = new Uint8Array(new ArrayBuffer(value));
            tmp.set(new Uint8Array(this.buffer, 0 + this.bufferOffset, Math.min(this.length, value)));
            this._data = new DataView(tmp.buffer);
            this._position = Math.min(this._position, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ByteArray.prototype, "bytesAvailable", {
        get: function () {
            return this._data.byteLength - this._position;
        },
        enumerable: true,
        configurable: true
    });
    ByteArray.prototype.clear = function () {
        this.$setArrayBuffer(new ArrayBuffer(0));
    };
    ByteArray.prototype.readBoolean = function () {
        console.assert(this.bytesAvailable >= 1, "out of range");
        return this._data.getUint8(this.position++) != 0;
    };
    ByteArray.prototype.readByte = function () {
        console.assert(this.bytesAvailable >= 1, "out of range");
        return this._data.getInt8(this.position++);
    };
    ByteArray.prototype.readBytes = function (bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        length = length || this.bytesAvailable;
        console.assert(this.bytesAvailable >= length, "out of range");
        bytes.position = offset;
        bytes.writeUint8Array(new Uint8Array(this.buffer, this._position + this.bufferOffset, length));
        this.position += length;
        // bytes.validateBuffer(offset + length);
        // for (let i = 0; i < length; i++) {
        // 	bytes._data.setUint8(i + offset, this._data.getUint8(this.position++));
        // }
    };
    ByteArray.prototype.readDouble = function () {
        console.assert(this.bytesAvailable >= ByteArray.SIZE_OF_FLOAT64, "out of range");
        var value = this._data.getFloat64(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT64;
        return value;
    };
    ByteArray.prototype.readFloat = function () {
        console.assert(this.bytesAvailable >= ByteArray.SIZE_OF_FLOAT32, "out of range");
        var value = this._data.getFloat32(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT32;
        return value;
    };
    ByteArray.prototype.readInt = function () {
        console.assert(this.bytesAvailable >= ByteArray.SIZE_OF_INT32, "out of range");
        var value = this._data.getInt32(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT32;
        return value;
    };
    ByteArray.prototype.readShort = function () {
        console.assert(this.bytesAvailable >= ByteArray.SIZE_OF_INT16, "out of range");
        var value = this._data.getInt16(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT16;
        return value;
    };
    ByteArray.prototype.readUnsignedByte = function () {
        console.assert(this.bytesAvailable >= 1, "out of range");
        return this._data.getUint8(this.position++);
    };
    ByteArray.prototype.readUnsignedInt = function () {
        console.assert(this.bytesAvailable >= ByteArray.SIZE_OF_UINT32, "out of range");
        var value = this._data.getUint32(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT32;
        return value;
    };
    ByteArray.prototype.readUnsignedShort = function () {
        console.assert(this.bytesAvailable >= ByteArray.SIZE_OF_UINT16, "out of range");
        var value = this._data.getUint16(this.position, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
        return value;
    };
    ByteArray.prototype.readUTF = function () {
        var length = this.readUnsignedShort();
        if (length == 0)
            return "";
        return this.readUTFBytes(length);
    };
    ByteArray.prototype.readUTFBytes = function (length) {
        console.assert(this.bytesAvailable >= length, "out of range");
        var bytes = new Uint8Array(this.buffer, this.bufferOffset + this.position, length);
        this.position += length;
        return this.decodeUTF8(bytes);
    };
    ByteArray.prototype.writeBoolean = function (value) {
        this.checkSize(ByteArray.SIZE_OF_BOOLEAN);
        this._data.setUint8(this.position++, value ? 1 : 0);
    };
    ByteArray.prototype.writeByte = function (value) {
        this.checkSize(ByteArray.SIZE_OF_INT8);
        this._data.setInt8(this.position++, value);
    };
    ByteArray.prototype.writeBytes = function (bytes, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = 0; }
        if (offset < 0 || length < 0)
            return;
        var total = bytes.length - offset;
        length = length || total;
        var writeLength = Math.min(total, length);
        if (writeLength == 0)
            return;
        this.checkSize(writeLength);
        // let tmp_data = new DataView(bytes.buffer);
        // let length = writeLength;
        // while(length-->0) {
        // 	this.data.setUint8(this.position++, tmp_data.getUint8(offset++));
        // }
        new Uint8Array(this.buffer, this.position + this.bufferOffset, writeLength)
            .set(new Uint8Array(bytes.buffer, offset + bytes.bufferOffset, writeLength));
        this.position += writeLength;
    };
    ByteArray.prototype.writeDouble = function (value) {
        this.checkSize(ByteArray.SIZE_OF_FLOAT64);
        this._data.setFloat64(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT64;
    };
    ByteArray.prototype.writeFloat = function (value) {
        this.checkSize(ByteArray.SIZE_OF_FLOAT32);
        this._data.setFloat32(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_FLOAT32;
    };
    ByteArray.prototype.writeInt = function (value) {
        this.checkSize(ByteArray.SIZE_OF_INT32);
        this._data.setInt32(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT32;
    };
    ByteArray.prototype.writeShort = function (value) {
        this.checkSize(ByteArray.SIZE_OF_INT16);
        this._data.setInt16(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_INT16;
    };
    ByteArray.prototype.writeUnsignedInt = function (value) {
        this.checkSize(ByteArray.SIZE_OF_UINT32);
        this._data.setUint32(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT32;
    };
    ByteArray.prototype.writeUnsignedShort = function (value) {
        this.checkSize(ByteArray.SIZE_OF_UINT16);
        this._data.setUint16(this.position, value, this.endian == Endian.LITTLE_ENDIAN);
        this.position += ByteArray.SIZE_OF_UINT16;
    };
    ByteArray.prototype.writeUTF = function (value) {
        var utf8bytes = this.encodeUTF8(value);
        var length = utf8bytes.length;
        this.writeUnsignedShort(length);
        this.writeUint8Array(utf8bytes);
    };
    ByteArray.prototype.writeUTFBytes = function (value) {
        this.writeUint8Array(this.encodeUTF8(value));
    };
    ByteArray.prototype.toString = function () {
        return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
    };
    ByteArray.prototype.writeUint8Array = function (bytes) {
        this.checkSize(bytes.length);
        new Uint8Array(this.buffer, this.position + this.bufferOffset).set(bytes);
        this.position += bytes.length;
    };
    ByteArray.prototype.getPlatformEndianness = function () {
        var buffer = new ArrayBuffer(2);
        new DataView(buffer).setInt16(0, 256, true);
        return new Int16Array(buffer)[0] === 256
            ? Endian.LITTLE_ENDIAN
            : Endian.BIG_ENDIAN;
    };
    ByteArray.prototype.$setArrayBuffer = function (buffer) {
        this._data = new DataView(buffer);
        this._position = 0;
    };
    ByteArray.prototype.checkSize = function (len) {
        this.length = Math.max(len + this._position, this.length);
    };
    ByteArray.prototype.encodeUTF8 = function (str) { return UTF8.encode(str); };
    ByteArray.prototype.decodeUTF8 = function (data) { return UTF8.decode(data); };
    ByteArray.SIZE_OF_BOOLEAN = 1;
    ByteArray.SIZE_OF_INT8 = 1;
    ByteArray.SIZE_OF_INT16 = 2;
    ByteArray.SIZE_OF_INT32 = 4;
    ByteArray.SIZE_OF_UINT8 = 1;
    ByteArray.SIZE_OF_UINT16 = 2;
    ByteArray.SIZE_OF_UINT32 = 4;
    ByteArray.SIZE_OF_FLOAT32 = 4;
    ByteArray.SIZE_OF_FLOAT64 = 8;
    return ByteArray;
}());
exports.ByteArray = ByteArray;
var UTF8 = (function () {
    function UTF8() {
        this.EOF_byte = -1;
        this.EOF_code_point = -1;
    }
    UTF8.encode = function (str) { return new UTF8().encode(str); };
    UTF8.decode = function (data) { return new UTF8().decode(data); };
    UTF8.prototype.encoderError = function (code_point) {
        console.error("UTF8 encoderError", code_point);
    };
    UTF8.prototype.decoderError = function (fatal, opt_code_point) {
        if (fatal)
            console.error("UTF8 decoderError", opt_code_point);
        return opt_code_point || 0xFFFD;
    };
    UTF8.prototype.inRange = function (a, min, max) {
        return min <= a && a <= max;
    };
    UTF8.prototype.div = function (n, d) {
        return Math.floor(n / d);
    };
    UTF8.prototype.stringToCodePoints = function (string) {
        /** @type {Array.<number>} */
        var cps = [];
        // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
        var i = 0, n = string.length;
        while (i < string.length) {
            var c = string.charCodeAt(i);
            if (!this.inRange(c, 0xD800, 0xDFFF)) {
                cps.push(c);
            }
            else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                cps.push(0xFFFD);
            }
            else {
                if (i == n - 1) {
                    cps.push(0xFFFD);
                }
                else {
                    var d = string.charCodeAt(i + 1);
                    if (this.inRange(d, 0xDC00, 0xDFFF)) {
                        var a = c & 0x3FF;
                        var b = d & 0x3FF;
                        i += 1;
                        cps.push(0x10000 + (a << 10) + b);
                    }
                    else {
                        cps.push(0xFFFD);
                    }
                }
            }
            i += 1;
        }
        return cps;
    };
    UTF8.prototype.encode = function (str) {
        var pos = 0;
        var codePoints = this.stringToCodePoints(str);
        var outputBytes = [];
        while (codePoints.length > pos) {
            var code_point = codePoints[pos++];
            if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                this.encoderError(code_point);
            }
            else if (this.inRange(code_point, 0x0000, 0x007f)) {
                outputBytes.push(code_point);
            }
            else {
                var count = 0, offset = 0;
                if (this.inRange(code_point, 0x0080, 0x07FF)) {
                    count = 1;
                    offset = 0xC0;
                }
                else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                    count = 2;
                    offset = 0xE0;
                }
                else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                    count = 3;
                    offset = 0xF0;
                }
                outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                while (count > 0) {
                    var temp = this.div(code_point, Math.pow(64, count - 1));
                    outputBytes.push(0x80 + (temp % 64));
                    count -= 1;
                }
            }
        }
        return new Uint8Array(outputBytes);
    };
    UTF8.prototype.decode = function (data) {
        var fatal = false;
        var pos = 0;
        var result = "";
        var code_point;
        var utf8_code_point = 0;
        var utf8_bytes_needed = 0;
        var utf8_bytes_seen = 0;
        var utf8_lower_boundary = 0;
        while (data.length > pos) {
            var _byte = data[pos++];
            if (_byte == this.EOF_byte) {
                if (utf8_bytes_needed != 0) {
                    code_point = this.decoderError(fatal);
                }
                else {
                    code_point = this.EOF_code_point;
                }
            }
            else {
                if (utf8_bytes_needed == 0) {
                    if (this.inRange(_byte, 0x00, 0x7F)) {
                        code_point = _byte;
                    }
                    else {
                        if (this.inRange(_byte, 0xC2, 0xDF)) {
                            utf8_bytes_needed = 1;
                            utf8_lower_boundary = 0x80;
                            utf8_code_point = _byte - 0xC0;
                        }
                        else if (this.inRange(_byte, 0xE0, 0xEF)) {
                            utf8_bytes_needed = 2;
                            utf8_lower_boundary = 0x800;
                            utf8_code_point = _byte - 0xE0;
                        }
                        else if (this.inRange(_byte, 0xF0, 0xF4)) {
                            utf8_bytes_needed = 3;
                            utf8_lower_boundary = 0x10000;
                            utf8_code_point = _byte - 0xF0;
                        }
                        else {
                            this.decoderError(fatal);
                        }
                        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                        code_point = null;
                    }
                }
                else if (!this.inRange(_byte, 0x80, 0xBF)) {
                    utf8_code_point = 0;
                    utf8_bytes_needed = 0;
                    utf8_bytes_seen = 0;
                    utf8_lower_boundary = 0;
                    pos--;
                    code_point = this.decoderError(fatal, _byte);
                }
                else {
                    utf8_bytes_seen += 1;
                    utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                    if (utf8_bytes_seen !== utf8_bytes_needed) {
                        code_point = null;
                    }
                    else {
                        var cp = utf8_code_point;
                        var lower_boundary = utf8_lower_boundary;
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                            code_point = cp;
                        }
                        else {
                            code_point = this.decoderError(fatal, _byte);
                        }
                    }
                }
            }
            //Decode string
            if (code_point !== null && code_point !== this.EOF_code_point) {
                if (code_point <= 0xFFFF) {
                    if (code_point > 0)
                        result += String.fromCharCode(code_point);
                }
                else {
                    code_point -= 0x10000;
                    result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                    result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                }
            }
        }
        return result;
    };
    return UTF8;
}());
var Endian = (function () {
    function Endian() {
    }
    Endian.LITTLE_ENDIAN = "littleEndian";
    Endian.BIG_ENDIAN = "bigEndian";
    return Endian;
}());
exports.Endian = Endian;
//# sourceMappingURL=ByteArray.js.map