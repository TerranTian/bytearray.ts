// "use strict";

import * as assert from "assert";

import {ByteArray,Endian} from "../src/ByteArray"

describe('ByteArray', ()=>{
    it("bytes len:should euqal", () => {
      let a = new ByteArray();
      a.writeInt(100);
      a.writeShort(20);

      assert.deepEqual(a.length,6);
    });

    it("test writeUTF", () => {
      let f = "我是中国人"
      let a = new ByteArray();
      a.writeUTF(f);
      a.position = 0;

      assert.equal(a.readUTF(),f);
    });

    it("test writeBytes", () => {
      let f = "我是中国人"
      let a = new ByteArray();
      a.writeShort(100);
      a.writeUTF(f);
      a.writeShort(200);

      let b = new ByteArray();
      b.writeInt(1);
      b.writeBytes(a);
      b.position = 0;

      assert.deepEqual([b.readInt(),b.readShort(),b.readUTF(),b.readShort()],[1,100,f,200]);
  });

  it("getPlatformEndianness", () => {
      assert.deepEqual(new ByteArray().getPlatformEndianness(),Endian.LITTLE_ENDIAN,"小端");
  });
    
});

