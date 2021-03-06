/**
 Copyright 2014 Gordon Williams (gw@pur3.co.uk)

 This Source Code is subject to the terms of the Mozilla Public
 License, v2.0. If a copy of the MPL was not distributed with this
 file, You can obtain one at http://mozilla.org/MPL/2.0/.

 ------------------------------------------------------------------
  Blockly blocks for Nordic Thingy:52
 ------------------------------------------------------------------
**/

var THINGY_COL = 250;
var THINGY_SENSORS = [
    ['Temperature (C)', 'Pressure|d.temperature'],
    ['Pressure (hPa)', 'Pressure|d.pressure'],
    ['eCO2', 'Gas|d.eCO2'],
    ['TVOC', 'Gas|d.TVOC'],
    ['Acceleration (List of X,Y,Z)', 'Acceleration|[d.x,d.y,d.z]'],
    ['Acceleration X', 'Acceleration|d.x'],
    ['Acceleration Y', 'Acceleration|d.y'],
    ['Acceleration Z', 'Acceleration|d.z'],
    ['Acceleration Magnitude', 'Acceleration|Math.sqrt(d.x*d.x+d.y*d.y+d.z*d.z)'],
    ['Gyro X', 'MPU|d.gyro.x'],
    ['Gyro Y', 'MPU|d.gyro.y'],
    ['Gyro Z', 'MPU|d.gyro.z'],
    ['Gyro Magnitude', 'Acceleration|Math.sqrt(d.gyro.x*d.gyro.x+d.gyro.y*d.gyro.y+d.gyro.z*d.gyro.z)'],
    ['Magnetometer X', 'MPU|d.mag.x'],
    ['Magnetometer Y', 'MPU|d.mag.y'],
    ['Magnetometer Z', 'MPU|d.mag.z'],
    ['Magnetometer Magnitude', 'Acceleration|Math.sqrt(d.mag.x*d.mag.x+d.mag.y*d.mag.y+d.mag.z*d.mag.z)'],
    ['Color (List of R,G,B,Clear)', 'Color|[d.r,d.g,d.b,d.c]'],
    ['Color Red', 'Color|d.r'],
    ['Color Green', 'Color|d.g'],
    ['Color Blue', 'Color|d.b'],
    ['Color Clear', 'Color|d.c']
  ];
var THINGY_SOUNDS = [
  ['Collect Point 1', 'collectpt1'],
  ['Collect Point 2', 'collectpt2'],
  ['Explosion 1', 'explosion2'],
  ['Explosion 2', 'explosion4'],
  ['Hit', 'hit'],
  ['Pickup 1', 'pickup1'],
  ['Pickup 2', 'pickup3'],
  ['Shoot 1', 'shoot0'],
  ['Shoot 2', 'shoot1'],
  ['Recorded Sound', 'recorded']
];

function thingyStatement(blk, comment) {
  blk.setPreviousStatement(true);
  blk.setNextStatement(true);
  blk.setColour(THINGY_COL);
  blk.setInputsInline(true);
  blk.setTooltip(comment);
}
function thingyInput(blk, comment) {
  blk.setOutput(true, ['Number','List']);
  blk.setColour(THINGY_COL);
  blk.setInputsInline(true);
  blk.setTooltip(comment);
}

// ----------------------------------------------------------
Blockly.Blocks.thingy_sound_play = {
  category: 'Thingy',
  init: function() {
    this.appendDummyInput()
         .appendField('Play Sound')
         .appendField(new Blockly.FieldDropdown(THINGY_SOUNDS), 'SOUND');
    this.appendValueInput('SAMPLERATE')
         .setCheck('Number')
         .appendField("at");
    this.appendDummyInput()
         .appendField('samples/sec');
    this.appendStatementInput('DO')
         .appendField("when finished");
    robotStatement(this, 'Play a sound at a specific sample rate');
  }
};
Blockly.JavaScript.thingy_sound_play = function() {
  var sound_id = this.getTitleValue('SOUND');
  var pitch = Blockly.JavaScript.valueToCode(this, 'SAMPLERATE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '4000';
  var branch = Blockly.JavaScript.statementToCode(this, 'DO');
  var sound_var = "wave_"+sound_id;
  if (sound_id=="recorded") Blockly.JavaScript.definitions_["wave_recorded"] = "var wave_recorded = [];";
  else Blockly.JavaScript.definitions_[sound_var] = "var "+sound_var+"=atob(\""+THINGY_SOUND_DATA[sound_id]+"\");";
  return "Thingy.sound("+sound_var+","+pitch+",function() {\n"+branch+"});\n";
};
// ----------------------------------------------------------
Blockly.Blocks.thingy_sound_record = {
  category: 'Thingy',
  init: function() {
    this.appendDummyInput()
         .appendField('Record Sound for')
    this.appendValueInput('LEN')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('milliseconds');
    this.appendStatementInput('DO')
        .appendField("when finished");
    robotStatement(this, 'Record a sound at a 8192Hz sample rate. Max 1 second');
  }
};
Blockly.JavaScript.thingy_sound_record = function() {
  var millisecs = Blockly.JavaScript.valueToCode(this, 'LEN', Blockly.JavaScript.ORDER_ASSIGNMENT) || '1000';
  var branch = Blockly.JavaScript.statementToCode(this, 'DO');
  Blockly.JavaScript.definitions_["wave_recorded"] = "var wave_recorded = [];";
  return "wave_recorded = [];\n"+ // ensure memory is freed before we start recording
         "if ("+millisecs+">1000) console.log('Can only record 1 second or less');\n"+
         "else Thingy.record(parseInt(("+millisecs+")*8192/1000),function(_d) {\nwave_recorded=_d;\n"+branch+"});\n";
};
// ----------------------------------------------------------
Blockly.Blocks.thingy_sensor_once = {
  category: 'Thingy',
  init: function() {
    this.appendDummyInput()
         .appendField('For one')
         .appendField(new Blockly.FieldDropdown(THINGY_SENSORS), 'SENSOR');
    this.appendStatementInput('DO')
        .appendField("do");
    robotStatement(this, 'Read Sensor once, put value in the \'Sensor Reading\' block');
  }
};
Blockly.JavaScript.thingy_sensor_once = function() {
  var arg = this.getTitleValue('SENSOR').split("|");
  var branch = Blockly.JavaScript.statementToCode(this, 'DO');
  return "Thingy.get"+arg[0]+"(function(d) {\n_result="+arg[1]+";\n"+branch+"});\n";
};
// ----------------------------------------------------------
Blockly.Blocks.thingy_sensor_many = {
  category: 'Thingy',
  init: function() {
    this.appendDummyInput()
         .appendField('For every')
         .appendField(new Blockly.FieldDropdown(THINGY_SENSORS), 'SENSOR')
         .appendField('reading');
    this.appendStatementInput('DO')
        .appendField("do");
    robotStatement(this, 'Keep reading sensor, put value in the \'Sensor Reading\' block');
  }
};
Blockly.JavaScript.thingy_sensor_many = function() {
  var arg = this.getTitleValue('SENSOR').split("|");
  var sType = arg[0];
  var sArg = arg[1];
  var branch = Blockly.JavaScript.statementToCode(this, 'DO');
  /* slightly odd behaviour here allows us to have *multiple* callbacks
   for the same device. Only downside is it'll turn the relevant device
   on right at the start. */
  Blockly.JavaScript.definitions_["sType"] =
     "Thingy.on"+sType+"(function(d) {\nThingy.emit('"+sType+"',d);\n});";
  return "Thingy.on('"+sType+"',function(d) {\n_result="+sArg+";\n"+branch+"});\n";
};
// ----------------------------------------------------------
Blockly.Blocks.thingy_result = {
  category: 'Thingy',
  init: function() {
    this.appendDummyInput()
        .appendField('Sensor Reading');
    robotInput(this, 'The result of the sensor reading from the Thingy');
  }
};
Blockly.JavaScript.thingy_result = function() {
  return ["_result", Blockly.JavaScript.ORDER_ATOMIC];
};
// -------------------------------------------------------------

// 0 Collect_Point_00.wav
// 1 Collect_Point_01.wav
// 2 Explosion_02.wav
// 3 Explosion_04.wav
// 4 Hit_00.wav
// 5 Pickup_01.wav
// 6 Pickup_03.wav
// 7 Shoot_00.wav
// 8 Shoot_01.wav

var THINGY_SOUND_DATA = {
  collectpt1 : "e357fnp/eoB4g3hxknV4gW2OgWOXe22FhWOQgW2CgnGJgWmJgWqMgGyIgG2JgmqJgGqNgmmKgGmMgGqOf2iNgGmNgGmNgWmOgWiNgWiNgWiMgmiMgmeMgmaNgWiNgmiNgWqLgmuKgWyHgmyHgG6FgmyIgGyKf2yKf22JgG2JgG6HgHCIfm+IfnGGf3GGfnGGgHGFf3KEgHGGf3KEf3KEfnSDf3SDfnaBf3WCfXiAfnaCfHl+gHaCe3t7g3CSjWJ7gHuKhnx9bHx9jXt5dXGGhX18cHh+in16d3GDhX1/cXl9hoB6d3OAhX6Acnp7hoB9dnZ7iHuFa46JY4F4gYOBhnljfnaOhHhtdIR+kXZpgHOKjHdvdn2BkXhsfm+Jj3Z2c3iCkXtuf2uHkXZ8c3GDjn5yfWmEk3WBc22Ei4B1e2mBkneCdWuEiYJ5emx/k3iDdmqGhoJ8dm1+kXqEdmeIg4GBcm5+jXyGdmaJgoCFb25+in+Hd2WJgICJa26AhoKIeGWIf36NaW2BgoWKd2eHfX2OaWyCfoiLeGmFfXuOamqEeYuKgG98f4CVZ2SDgIWKeXZ/dnqVa2KCfYeKeHl+dnqUcGOAfIiLdnx8d3ePemN7eIiOd358dXqPeml1fIOdeXB/f4eDcmmBbn6RhHpsdo6GdW59c32Qhn5scY+Hd3B5dXuMhoNtbY6HeXN3dnqJhoZvao2IenZ0eHqGh4hxZ4qIfXhxeHmCiYpzZYeIf3tveXl+iox2ZIGIgX5uenl6iox6ZXuHhIBuenl2i4x9aHaGh4JueXpzi4x9bHGDiYRueXpxiox/cG2BjIVweXpwiYyAdGh+joVyeHpwiIuBeGV7kIZ0eHhwhYqDfGN2kYZ3eHdxg4mEgWJxkYd7eHVygYeFhGNtkYd+enJzgIWHh2Rpj4eCe290foSIiWVljoeFfW11fYGJimhji4iGf2t2fX+Ji2xhiIiIgml2fX2JjG9gg4mJhGl1fnuIjHJhf4mJhml0f3mIi3VjeoiLh2p0f3iHinhmdoiMh2xzgHeGiXprcoaMiG1zgHeEiHtvcIKNiG9ygHeDiHt0bn6OiXFygHaBh3x4bnuNiXRygHZ/hnx7cHeMiXZyf3h9hnx+cXSLiXhxf3l7hX2AdHGIinpxfnt5hH2AeHCFin1xfH14g32Be2+CiX9yen93gX6Bfm9/iIFzd4B3gH+AgXB8h4F1doF3foB/hHF5h4F2dYB5fIB/h3R1hoF4dX96e39+indyhYF5dn16en9+i3pvhIB6eHp7en5+jH5sgoB6end6en5+joFrgIB6fXV5e3x/joVqfoF5f3J3fHx/j4hpe4F6gnF0fXuAj4prd4F6hHFxfnuAj4xtdIF5hXJuf3qBj4xwcn97h3Nrf3qBkI1zcH17iHRpf3mBkI12b3p8iXZofnmBko16bnZ8iXhmfXmAkox9b3J7inpme3mAk4x/cG96inxmeXl/lIyBc2x4in9ndnh+lY2DdGl3iYFoc3h9lI6Fd2d1iINrcHl8k4+GeWZzhoVtbXh8kpCHfGdwhIVxa3d9j5KIfmhugYZ1aXZ9jZOJf2ltf4V4aHR+i5OLgWxrfIR7aXJ/iJOMgm5peYN+anB/hpKOhHJodoKAbG5/hZGPhXZndIGBb2x9g5CPhnlncYCCc2t7go+Qh31obX+Cdmx4gI6Qh4Fpa36BeW12f4yQiIRqaH2BfG5zfouQiIdtZXuAfnBxfYmQiIlwZHp/gHNue4iQiYp0Y3h+gnZseoaPiop3Y3Z8gnpreYWNi4p6ZXN7gn1qeIOLjYp9Z3F6g4Bpd4OIjop+am94g4NqdYKFj4p/bW12goVrc4KDkIp/cWx0godscoGAkIt/dWxygolvcIB+kI1+eGxwgYpxbn99j45+em1ugYp0bX19jpB9fG5tgYp2bHt8jZB9fHBsgIp5bHh8jJF9fXJsgIl8bHV9i5F9fHNsgIh9bnJ8ipF+fHVtgId/b298iZB/fHZtf4aAcmx7iY+Ae3huf4aBdGp5iY+BenlvfoWBd2l3iI6DeXpwfoWBeWh1ho2FeHpxfYaCe2hzhYyHeHpze4eCfWlwhIuJeHl1eYeDfmpugoqLeHd3d4eFfmxsgImNeXV5doaGf29qfYiOe3R7doWHf3Fpe4aOfnN8doOIgHRpeIWNgHN8d4CIgHdqdoSLg3R7eH6HgHpsc4OKhHV7eXyGgHxucIKIhXh6enuEgH9xbYCGhnt5e3uDgIB0a3+EhX54e3uBf4J3an2DhIJ4e3t/f4N6anuCg4V5e3t8foN9a3iBgYd6e3x6fYOAbHaAgIl7e314fIKCb3R+f4p9en53e4KDcnJ8fop/en91e4GDdnF6fYqAe4B0eYGCeXF4fYmCe4F0eIGBfXJ1fImDfIJ0doGAgHRze4iEfIN0dIB+gndxeoeFfYN1coB9g3pveYaFfoN2cYB8g31veIWGf4N4cH58goBud4SGgIJ5b318goJvdYSHgYF7b3t8gYRxdIOHgoB7cHp8f4Vzc4GHg398cXh8foV1c4CGhH98c3d8fYV3c3+GhX98dHZ7fIV5c36FhX98dnZ6fIR7c32Ehn98d3V6e4N9dHyDhoB7eHV5eoJ/dXyDhoF7eHZ5eYCBdnuChYJ7eXZ5eX+Cd3uChIN7eHd4eH6DeHqCg4R7eHd4eHyDenmCg4R8d3h3eHuDfHiCgoR9dnl3eHqCfniBgoR/dnl3eHqBf3mBgYSAdXl4d3qAgHmAgYOCdXl4dnp/gXp/gIODdXl5dXp+gnx+gIKEdnh6dHp9gn19f4GFd3h6dHp9gn98foGGeXd7c3p9gYB8foCGe3Z7c3l9gIJ7fYCGfXZ7c3l+gIN7fH+Gf3Z6dHh+f4R8en+FgHZ5dHd+f4R8en6Egnd4dXd+foR9eX6DhHh4dXZ+foR+eX2DhHl3dnZ+foN/eHyChXt2d3V+foKBeHyBhXx2d3V9f4KCeHqAhX52d3V8f4GDeXl/hYB2d3V8gH+Denh+hIF3d3V7gH+DfHd+g4J4d3V6gX6DfXZ9goN6d3Z5gX6CfnV8goN7d3Z4gX+CgHV7gYN9dnd4gH+BgXV6gIN/d3d4f3+AgnZ5f4KAd3d4foB/gnd4f4GCeHd4fYB+gnl3foCDeXd5fIB+gnp3fX+Dend6e4B+gXt3fH6Ee3Z7en9/gH13e32EfXZ7en5/f354enyEf3d8en6Af355eXuDgHd8enyBfn56eHqCgnh8enuBfn97d3qBg3l8e3qBfX58d3mAg3p7e3qBfX59d3l/hHx6fHmBfn1+d3l+g316fHmAfn1/d3l9gn96fHp/fnx/d3h9gYF6fHp+fnyAd3h9gIJ7e3t9fnyAeHh8f4R8ent9fnyAeXd8foR9eXt8fnx/end8fYR/eHt8fn1/end8fISAeHt8fn1/e3d8fIOCeHt8fX1+fHd7fIKDeXp8fX1+fXd6fIGEeXl8fX59fXd6fICEenl7fX59fXh6fX+EfHl7fH58fXl5fX+EfXh7fH58fnp5fX6Efnl7e358fXt5fX2DgHl6e358fXx5fX2CgXl6e318fX15fHyBgnl6en18fH56fHyAg3p6enx9fH56fHx/g3t6ent9fH57fHx+g3x6enp9fH59fHx9g316enl9fH5+fHx8g356e3h8fH1/fHx8gn96e3h7fX1/fXt7gYB6e3h6fX2Afnt7gIF7e3h5fnyAf3t7f4F7e3h4fXyAgHt6foJ8e3h3fX2AgXx6fYJ9e3h2fX2Agnx6fIF+e3l2fH2Agn16e4CAe3l1e35/g316e4CAe3l1en5/g356en+BfHl1eX5/hH96en6BfXl1eH5/hH96en2CfXl2d35/g4B7enyBfnl2d31/g4F7e3uBf3l2dn1/g4J7e3uAgHl2dnx/g4J7e3p/gXp2dnt/goN8fHp+gXp2dnp/goN9fHt9gnt2dnp/gYN9fHt8gnx2dnl+gYN+fHt7gX12dnh+gYN/fHx6gX12d3h+gYN/fHx6gH53d3h9gYKAfHx6f393d3h9gYKAfH17f393d3h8gYGAfX17foB4d3h8gYGAfX17fYB5d3h7gIGAfn18fX95d3h6gICAfn18fH96d3h6gIB/f318fH97d3h6gIB/f319fH58eHh5f4B+f319fH58eHh5foB+f319fX19eXh5foB+f318fX19eXh5fYB+f318fXx9enh5fIB+f358fnx9e3h5fIB+f358fnx9fHl5e4B+fn58fnx8fHl5e39+fn98fnx8fXl6e35+fn98fnx7fnp6e35+fX98fn17fnp6e31+fX99fn16fnt6e3x+fX99fn16fnx6e3x9fX99fn16fn16e3t9fX5+fX16fX56fHt8fX5+fX16fX57fHt8fn5+fn16fH97fHt7fX5+fn16fH98fHt6fX5+fn16e398fHt6fX5+fn16e399fHt5fX5+fn17en9+fHx5fH5+f317en5+fXx5fH5+f317en5/fXx5e35+f317en1/fXx5e359f317enx/fnx5en59f357enx/fn15en59f357e3t/f316eX19f357e3t/f316eX19f357e3t+f316eX19f397e3t+gH17eXx9fn97e3t9gH57eXx9fn98e3t8gH57eXt9fn98e3t8gH97eXt9fn98e3t7f398enp9fn99e3x7f398enp8fn99e3x7foB8enp8fn9+e3x7foB9e3l8fn9+e3x7fYB9e3l7fn9+e3x7fYB9e3p7fn5+fHx7fIB9fHp6fX5+fHt7fIB+fHp6fX5+fXt7e39+fHt6fX5+fXt7e39/fHt5fX5+fXx7e35/fHt5fH5+fnx7e35/fXx5fH5+fnx7e31/fXx6e35+fnx7e31/fXx6e35+fnx7e3x/fXx6en5+fn17e3x/fnx6en5+fn17e3x+fn17en1+fn17e3x+fn17en1+fn57e3x9fn17en1+fn57e3x9fn18enx+fn58e3x9fn18enx+fn58e3x8fn18ent+fn58e3x8fn58ent+fn59e3x8fn58e3t+fn59e3x8fX59e3t9fn59e3x8fX59e3t9fn59e3x8fX59fHt9fn5+e3x8fH59fHt8fn5+e3t8fH59fHt8fn5+fHt8fH59fHt7fn5+fHt8fH5+fHt7fX5+fHt8fH5+fHx7fX5+fHt8fH1+fHx7fX5+fXt8fH1+fHx7fX5+fXt8fH1+fHx7fH5+fXt8fHx+fXx7fH5+fXx8fHx+fXx8fH5+fXx8fHx+fXx8e35+fXx7fHx9fXx8e31+fXx7fHx9fXx8e31+fX17fHx9fXx8e31+fX17fHx9fX18e3x+fX18fHx9fX18e3x+fX18fHx8fX18fHx+fX18e3x8fX18fHx+fX18e3x8fX19fHx9fX18e3x8fX19fHt9fX19e3x8fX19fHt9fX19e3x8fX19fHt9fX19fHx8fH19fHx8fX19fHx8fH19fHx8fX19fHx8fH19fHx8fX19fHx9fH19fHx8fX19fHx8fH19fXw=",
  collectpt2 : "kNzn57I6ExQljt/i46AzFxgtld/e3ZYuGxo6pdzb1oUsHx9DqtrWz3sqJCNStdTUxW4sKSlbt9DOvWYuLi9qvMrMsVwvLzNxwMvLrFQuLzaAxcnMoUsuLzqFyMrLm0QuLkCUycrJjj4uLkWazMnHhjkvLU6ny8vDeTUvLlSszcrAcTEvLmC2y8y5ZTAvMGa6zMu0XS4vMnXBys2qUy0uNXvFysykSy0uOorIysyYRC0uPpDKysqRPS4tRp7LyseDOS4tTKPNysR8NC8tV6/LzL9vMi4uXbTNy7tnLy8varzLzbJbLi4ycMDLzK1TLS41gMXKzaFKLS45hcjKy5tELS0/lMrKyo49LS1EmszKyIY4LixOp8zLxHk0Li1TrM3LwHExLy1gt8vNuWUvLi9mu8zMtV0tLjF1wsvNqlItLjV7xcvMpEstLTqKyMrMmEMtLT6Qy8rKkT0tLEaey8vIgzgtLUujzcrFfDQuLFevzMy/bzEuLly0zcu7Zi8uL2q9y82yWy4uMnDAzMytUy0uNYDFys2hSi0uOYXIy8ybQy0tP5XKy8qOPS0tRJrMysiGOC4sTqfMy8R5NC4tU6zNy8FxMS4tYLfMzbllLy4vZrvMzLVdLS4xdcLLzapSLS41e8XLzKRLLS05isjKzJhDLS0+kMvKypE9LS1Gn8vLx4Q4Li1Mo87KxXs1LS5VssrIcCwtWcLJxGAtLGjHyrxTLS53y8uxRC4vh8zMojovM5XMzZQzLzmjzMyFMC9Cr8zKdi0uTbnLxmctLVrBy8BZLS1ox8u4TC4ueMrLrkIuMo7LzKI6Ljedy82UNC4/qsvMhjAtSbXKynYuLVS+ycZnLS1ixcnAWS0tcMnKuEwtL3/Ly6tALzKPzMybNzA3nczMjDIvPqrMy3wvL0i0y8htLS5UvcvDXy0uYcTLvFIuLnDIy7NGLzCBy8uoPS81lcvMmjcvO6TLzIwyLkSwyst9Ly5PusnIbi4tXMLJw2AtLmrHybxTLi94ysmyRy4xiMvLpDwwNZfLzJM0MDuky8uEMDBEr8vJdC4vTrnKxWYuLlvAyr9YLi5pxsq3TC8vecnKrUEwMonLy6A6LzidysySNC9AqsnLhDEuSrXJyXUvLla+yMVmLi5kxMi/WS4vcsjIt00vMYHKyaxCLzSQy8qdOTA5nsvLizMwQKrKyXswMEq0ysZsLy9WvcnBXi8vY8PJulEvL3HHyrFGMDGBysqmPTE1kcrKmTcwPaPJy4ozMEawyMl8MC9RucjGbS8vXsHHwV8vL2zGx7pSLzB6ycixRzAzicrJpT4wN5fKyZU3MT2kycmDMjFGr8nHczAwUbnJw2UwMF3Ayb1XMDBrxcm1TDExesjJqkIyNInJyZ86MjiYycmRNTFCqcjJgjIwTLTHx3QwMFi9xsNmMDBlw8a9WDAxdMfHtU0wMoLJx6pDMTaQycieOzI7nsnIjTUyQqrIx3syMUy0yMRsMTFYvMe/XjEwZcLIuFEyMXPFyK9HMjOCyMikPjM3kMnIlzgzPJ/IyIk0Mkeuxsd6MjFTuMbEbDExYL/Fv18xMW3ExrhTMTN8x8avSDI1isjHo0AyOpjIx5Y5M0Ckx8eFNTNIr8fFczMyU7jGwGQyMl++xrpXMzJtw8ayTDMze8bHqEM0NonHx5w8NDqXx8ePNzRBpMbGgTQzTrPFxXIzMlq7xMBlMjJnwcS6WDMzdcTFsk0zNYPGxahEMzmRx8acPTQ+nsbGjjg0RanFxX01NE+zxcFsNDNausW8XjQzZ8DFtVI0M3XDxaxINTWDxcahQDY5kMbGlTo2P53GxYc2NkeqxcR5NDRVtsPBazQzYr3DvF40NG/Bw7VTNDV9xMSsSTU4i8XEoUE1PZjFxJU7NUOkxMSHNzVLrsTCdTU1VrbDvmU1NGK8w7dYNjRvwMSvTTY2fMPEpUQ3OIrExJo+Nz2XxMSNOTdEo8TDgDY3Ta7DwXI1NVy4wb1kNTVpvsK3WTY2d8HCr042OITDwqZGNjySw8OaPzdBnsPDjTo3SKnCwn83N1Kywr9uNzZduMK5Xzc2ab3CslM4NnbAwqlJODiEwsOeQjk8kcPDkjw5Qp3CwoY5OUmowsB4NzhTscG9azc3Y7rAuV43N3G+wLJUODl+wcGpSzg7i8HBn0M4QJjBwZM+OEajwcGGOjhOrcC/eDg4WLTAu2g4OGS6wLRZOThxvcCsTzo5fsDBokc6PIvBwZdAO0CXwcGLPDtHosC/fjk6T6zAvXE4Olq0v7llOTlqu760WTk5eL6/rFA6PIW/v6NIOj+SwMCYQjpFnb+/iz46TKe+vn47OlWwvrxxOjpftr63Yjo5a7q+r1U7Oni9v6ZMPDyFvr+cRTxAkb+/kEA9RZy/voQ8PEymvrx3OzxVrr65azo7YbW9tV87O3G7va5VOzx/vb2mTTw/jL6+nEY8RJe9vpBBPEqivb2EPjxSq7y7eDw8W7K7uGs8PGa3vLJdPDxzurypUT49f7y9n0k+QIu9vZVEPkSWvb2JQD5Koby7fT0+Uqm8uXE8Plyxu7VlPD1otruwWz0+eLq7qFI+QIW7u59KPkORu7yVRT5JnLu7iUE+UKa6un0/PliturhxPj5is7m0ZT4+bbe5rVk/Pnm5uqNPQECFuruZSEBEkbu7jkNBSZu6uoJAQFCkurh2P0BYrLm1az9AY7K5sGA/QG+2uapXQEF/uLmiT0BEi7m5mUlASJa5uY5FQE6guLmDQkBWqLi3d0BAX6+3tGxAQGm0t69hQEF0trenVUJCgLi4nU1DRIu4uZJHQ0iWuLiHRENOn7i3fEJCVqe3tHBBQl+tt7FmQUJpsrerXEJCdbW3pFRCRIW2t5xNQ0iQt7eSSUNNm7a3h0VDVKO1tnxDQ1yqtbNxQ0Nlr7SwZ0JDb7O0ql1DRHq1taFTREWGtraWTEVJkLa2jEhFTZq1tYFFRVSitbN2REVcqLWwa0REZa60rGJERXCxtKZZRUZ7tLSeUkVIirS1lU1FTZW0tYtJRVKes7SBR0VapbKydkVFYquyr2xFRWyvsqtjRUZ2srKkWkZHgLOzm1JHSYuzs5BMSE2Us7OFSUhTnbKye0dHWqSyr3FHR2KpsqxnR0dsrbGmXkdIdrCxoFdISYGxsphRSE2PsbKPTUhSmLGyhUpIWKCwsHtJSGCmr65xSEhoq6+raEhIcq6vpWBISXuwr59YSUuFsLCVUUpOj7Cwik1KU5ewr39LSlmfr652Skpgpa+rbEpKaKmvp2NKSnKsr6FcS0t8rq+aVktNhq+vklFLUpKur4lOS1ebra6ATEteoa2sdktLZqasqm1LS26qrKZlS0x3rKygXUxNga2smVdNUIqtrY9STVOSra2ET01Ymqysek1NXqCsqXFNTWalrKZpTU1uqKuhYU5Od6qrm1tOT4Crq5RWT1KKq6uMUk9Xlaqrg1BOXZyqqntPTmSiqahyTk5spamlak9PdKipoGNPUH2pqZpcUFKFqqmTV1BVjaqpiVNRWJWpqX9RUV6bqad2UFBkoKikblFQbKOooGZRUXSmqJxgUlJ8p6iVW1JUhaioj1dTV42oqIdUUlyXpqd+U1JjnKamdlJSaqGlo29SUnGjpZ9oU1N5paWaYlNUgaallF1UV4mmpY1ZVFqQpqWEVlRelqWkelVUZJukonJUVGqfpJ9rVVRxoaSbZVVVeaOklmBWVoCkpJBcVlmIpKSJWVdcj6OjgldWYpeionpXVmiboqBzVlZvn6GebFdXdqChmmdXWH2ioZViWFqEoqGPXlhci6GhiFtYYJGhoH9ZWWSWoJ93WVlpmaCdcFlZcJygmWpaWXaen5VlWlp9n5+QYVtcg5+fil5bXoqfn4RcW2KQnp59W1tolp2dd1tbbpmdm3FbW3SbnJdsXFx6nJyTZ1xdgZ2cj2NdX4acnIlhXWKMnJyDX15mkJubfF5eapSbmXVeXm+WmpZvX151mJqTal9fepmaj2dgYICamopkYGKFmZmFYmFlipmZgGFhaI6YmHphYW6Tl5Z1YWFzlZeUcWJieJaWkW1iY36Wlo1qY2SClpaJZ2Nmh5aWhGZkaYuVlX9lZGyOlJR5ZWVwkJSSdGVldJGTj3BmZnmSk4xtZ2d9kpOIa2dogZKShWloaoWSkYFpaGyIkZB9aWlwi5CPeWlpdI2PjnZqaniOjotzamt8jo6JcWtsf42Nhm9sboKNjINvbXCEjIyAbm5yhouKfW9vdYeKiXlwcHeHiYd3cXF6h4eFdnJyfIaGgnZ0dH6FhIB2dnd+goJ+eXl6fXx9fH18fXx9fH18fXx9fH18fXx9fH18fXx9",
  explosion2 : "lNfMVydBN3Q3YNlOLy02v8Ss1mBVcdFFT2e+aT64PztGvmJAZzUvXMyujcFRbcosfMe8SB80L1JWUTMyPJZdLKRMPUJMPDmrpoVKNUO9ZD4/ZJvFxZRDRGzFqaS1w7dttrOrwZ44bUIzSHyQb0Y4LFeHzJ1WsLixx7GQTGjWsKVQTUCiiDSmq7iFY0VDMsCOOU1gvUk5XlRik6OYO0dXfHtCl7uieiqioDiGv7fBs7WkvIw1QUO3nlJYULq9qJySyJArrMDGiTerpSmDvaKHL3eeq44vU3CqozBxzLmwR0oocLumq56txrCfs7VVSjpcpKXHXz1EQDhGSX2Shpuyf2aFh8eZPkU7UlM9UqZ6VoKRREmniS90wKiqm59tV05NXHK+n2SCu3s5SUBbY4+wXFGgoJyKYI+xr8JzQl9erqdedKV+TF5mhKOjsK+8qKqyw3hfp7dZPKe4Z1CksWtPRDhXW2ZlosChmJypb0FfdmBOTj1PSZDCqK1zOYiwrr+zwoxIg5+kvKaZcjZLUGChmklAg5WUmaCudERzpopSYZickZNhPYbKkUlkpJpaRIK8pJeOZHy8s7SraVxXSWVwYjxnurSlppWZZExRS0xHSlZVg61yO0Y6S6jIe0hRRk6GkqCxp6mlq6emnqWgqKzAdzhLfYpdPGK1tGo6ZIiQsLeQh5qtpKOaTzhRVW+srHlPibavrK2RY3iCiZCliFFKkrKlm5tOREdNSGNgdZmWrsOdREhOTl6ut5dRXExGV6mhppyjrcOlY2FmZ2hGR0BCPE4/e7Oqlph6S1KgvrGnqoRKW6TCsbyxtKOxpLiIUlRfY2iLn3lIP3Koom82VaK5nV1XXl9mVlRLjaqkVj1HX2tiVEpht7W3r7WmT0NVp6anoKWTa3VSS0pTUVuMmnxeW4a5qqqWpmpYWY+fmY6JkKurra6zonNyhLuuuKy6mU1EY7axrI+RkJaYi0dKR0dDRkZKRlBRVFBUTGa7tLZZTU5aY19iXmFdVFJVU1lPhLGlrrO6rGNgYFtaWkpKRnCMgaGop6y1sq+UoIFERkZDRkCUt6q2sLqgWV1bXl1eXl9eXVVVVUdCQ0llYGVHS0Blq6Gnsra1sKeoqntpbYC9rb+FW2JfVlNVUURHRE1QUFSrtLSwk42UdT9OPXG7qrqJZWhwqqSshmpybndxeV5VUWippaijoaObZWRkYFpcW1dUVVVhYWJgXV1dYWRjZaGxrKtSTEtNSU5GYZaQk5qzqLaMT1lUV1NWVFZTVlJZYGFgX1NXUl+ssa6wZ0xXTYWelpyRiIeJhGdlZWVTRU1DX5KMj46cnp2flYqNi4yeo6GjnZ6dnlpNUU9LSUpJSklKTKS2rrWhmpefbT5PP2WvqayppaWlpaeop6mekpWTk4OIg4hjW1teV05MT0tdXmNaeq2pqK5zT1tTXKGuqK2kkpSRln1la2hpkqKcoJ2ioaKinVpXV1hXWFdYV1dUVFRUVFNTU1NTU1NTU1NaZF5lW32wq62tpFtVVlVXVlpWW1NqqaumsX1DUUpNd4+EjYBXUVVSU0lNSUxNX1lfV3OHg4aCl7Oqsauwp6+ls4pRVVZQaa2nqqufYmdjZmNiX2FeYlRNTk5OUVxbXFtcWFdXV1dVS09LUEqZsautraqQj5COk39VW1daWFZPUk9ST1ZYWVdZVmRqamlrZoymnKSbqHlNVlFVUlRRU1JSUlOFlI6Sj5GUm5ealpuRbWttam5nhJ6ZnJqbm5GKjYuNi45rXmJfYmBiVVRTVVFek5OTk5Kbo6GioaKdm5ubm5qmq6mrqatgTFROVUuIpp2in6GjqaWqpK2LUl1VXVNrqqioqaeshW11cHVvepGSkZKRkpOXlZeUmI9eW11aXVhonZmcmpuanJ+fn6CfoJ2YmZiYmJiZnZydnJycnKSmpaWlpaadk5aTlZSVlaemqKWpo6yKVmFaX1pgWHaXkJSRlJGVcmJmZGVkZWVhWl1bXFtdWmJvbm5ubm5uboSNiY2JjYmPfWVnZmZnZWhjhKCanpudnJydlYyPjI+Mj4yQg2JlY2VjZWNlZJGbmZqamZqYnYplbGhraGpoY2FjYmNiYmVsaWtpa2lsWVdWWFVZU2WYk5aUlZSVl5yam5qbmpudpKGkoaWgqI5SWVVYVVhWWYeSjZGNkYuUb1VbWFpZWVlZjJiUlpSWlJaUkZCRkJGQkZCTmZmYmZiZmJmVbWpra2pramxqkJ+bnZucnJuekVVaVlpWWlZbU2uMiIqJiYmJioiQm5mampqampqamYmJiImIioiKh4xzXGFeYV9gX2BfYF9fXl9eX19fX19fYmNjY2NjY2RiZGFumpeZl5mXmZealZx8X2diZmJmY2ZiZ2B6ko2Pjo+Oj46Oj46PcWpta2xrbGtsbGxsamBhYGFgYWBhYGFgYV9xeHZ3d3d3d3d3d3d3eJOYl5iXl5eXl5eXl5eXmJmZmZmZmZmZmJmYmZiakIiKiImJiYmJiYmJiYmJiZOVlJWUlZSVlJWTlZOVkph1X2VhZGJkYmRiZGttbG1sbWxtbG1tgIODg4ODg4KDg4JxcHBxcHFwcXBxcHR5eHl4eXh5eHl4eWxmaGdoZ2hnaGZpZHyTjpGPkY+Rj5GPkYttbGxsbGxtbG1sbWxwdnV1dXV1dXV1dXZ0fI+Nj42OjY6Njo2OjI+FfX9+fn5+fn5/fn99gHFkZ2ZnZmdmZ2ZnZ2dnZ2lqampqampqampqampqam5vb29vb29vb29vb25wbXiMiYuJiomKiYqJiomKiYqGcG5ubm9ub25vb29vb29vb3GIiYmJiYmJiYmJiYiJiImIiYNzdXR1dHV0dXR1dXV1dXV1dXV1dXV1dXV1dXV2dXZ1dnV2dXZ1eYiIiIiIiIeHh4eHh4eHhoeGhoWHfnZ4d3h4eHh4eHl4eXl5eXl5enl6en+Af39/fnx9fH18fXx9fH18fXx9fH18fXx9fH0=",
  explosion4:"k8zV3Njb2NvY29jb2NvX3cmnRzs/PD49Pj0+PT4+Pj46IyEgISAhICIgIh8iHyMdKUGu4dHb1NrU2dXZ1NnU2tK/fzM/ODw6PDo8Ojs7Ozs7ODUzMzMzMzMzNDM0MzQzNSshJCIjIiMjIyMjIyQjJCMkIyQjJCMkIyQjJSImIScfNFa2287X0NXQ1dHU0dTR1NHW09bT1tLW0tfS19HY0NrL0HYkNiwzLzIwMTEwMi41KIDOz9fQ1tHV0dTS1NLU0tPSyKuvrK+sr6yurK6srqyurLCvsq+yr7Kus66zrbSruoUrLSQqJiknKScpKCgoKCgoKCgoKCgoKSgpKSkpKSkpKTBDT0xOTE5MTkxOTE5MTk1DNzIwMjAzMDMvNC81LTgncc3K0szQzdDOz87Pzs/O0MWqNiwvLS8tLy0vLTAsMSlFtMrPzM/MzszOzM7MzszOzM7MzszOzM7LzsvOy8/K0MfNiDhIP0ZBRUFEQkRCREJFha7BwMDAv8C/wL/Av8C/wLaeZGRjY2NjZGNkY2RiZl+FrLO4tLe1t7W2tba1tra1ucPHysjKyMrIysjJyMnIycjJyMnIycjJyMnIycjJx8nHyr+2t7e3t7e3t7e2t7a3trKppKSkpKSjpKOko6WjpaG8ycXHxsfGxsbGxsbGxsbGxbx0aW1qbWptam1qbmlwZI/KwcjDxsPGxMXExcTFxMXDxby3uLe4t7i3uLe4t7i3uLq+vr++v76/vb+9v7zAu8NiOjk1ODY3Njc3Nzc3Nzc3Q4jIvsTAw8DCwMLBwsHCwMK/r62urq6ura6trq2uq7GYTT03Ozc7ODs4Ozg7Nz01RmOmxLrAu7+8v7y/vL+8v7qyjW50cXNxc3FycnJycnJzjJaampqampqampqampqampucnZ2dnZ2dnZ2dnZ6dnpurury+vL28vby9vL28vby9vL21tLS0tLWztbO1s7axuplHQjpAOz87Pzw/O0A7QTlFSI7Et765vbq8uru7u7u6vHtGPz0/Pj8+Pz4/Pj8+Pz4/Pj8/Pz8/Pz8/QD9AP0A/P0FMTE1MTUxNTE1NTU1NTE9SVlZWVlZWVlZXVldWV1VaapObmJqZmZmZmZmZmZialpF5a3Bsb21vbW9tb21vbHBQQ0JDQUNBQ0FEQURBRUBGRXWroqakpaWkpaSmo6egrHZAR0FFQkVDRENEQ0REQ0VEX7GxsrKysrKysbOws6+3m1JMQUdDRkNGREZERkRGREZFRkVGRUZFRkVGRUZFRkVJlKu0s7Ozs7Ozs7Ozs7KzsrOupKWkpaSlpKWkpaSkpKSqsLGysbKxsrGysLKws662mVpMRkpHSUdJR0lHSkdLRVePq7Kvsa+xr7Gvsa+xrrKsrnxaY15iX2FfYV9hX2FeZ6Str66vrq+ur66vrq+ur62beEhNSkxLTEtMS0xLTEtMS05VVFVUVVRWVFZUV1NYUHOfqK+qrqutq62rrautqq+gZ1BMTk1OTU5NT01PTFBLVmeXsKitqayqq6qrqqqqqqtwUFBOUE9QT1BPUE9QT1BQUFBQUFBQUFBQUFBRUFFRUFuEqqepp6ioqKioqKeopquQY1RQU1FTUVNRU1JTUlNSU1JTUlNSU1JUU1RTVFNUU1RTVFNUU1RTVVNVU1VTVlNYe5Wno6WkpKSkpKSko6SipoBcVlZWVlZWVlZWVlZWVlZngKOioqKioqKioaKho6ClkWVZV1hYWFhZWFlYWVhZWVlZWVlZWVlZWVlaWVpZWllcao+alpmXmJeYl5iWmJaYlJF7bnFvcXBwcHBwcHBwcHBwb29vb29vb29vb29vb29vbGhnZmdmZ2ZoZmhmaWZqY36al5uYmpmamZmZmZiZmJmWhGJhYWFhYWJhYmFiYWNhZnCMmZWYlZeVl5WWlZaVlpWVkZCQkI+Qj5CPkI+QjpCNiHlrbm1ubW5tbm5ubm5ubm5ub29vb29vb29wb3BvcW5/jI2PjY6Njo2NjY2MjYyMioFwb29vb3BwcHBxcXFxcnFxcXJycnNzc3R0dHV1dnZ3eX6AfX18fXx9fH18fXx9fH18fXx9fH18",
  hit : "kaNHVEGQnUFWP42kRFRAg6tHU0F6r01PR2GvaEVRSayBQVREj6dJUkN1s1lKTk6rhkJVQn60YUdRSJ2ZQVZCarFlRFVBg6pQTE5Op5hIUEpbtIRFUUpZsXNEU0dkuH5GUUpYsnRGUUpZsIBFUUxNnJlFU0pMfbxcTU1Mab1uTExQS6KjUE1QSWu7dUhQTU6Rs1xOTFBNpZ9NT01NV66VSlFMTlq1iUpPT0tit4dKUU1PVKyZTFBNUE6XrlZOTVFJd7p5S09PTF+vn1RNT09MgLx9S09QTVSZsmZMUFBNV6KuX0xQT01XpKxfTFFPTlilrW5IVEtUSYy2e0hVS1VHcLGfWU1RT1BRlLR/R1VLVUhoqKxoSVVMVUlnq6ttR1ZKVkhop61vSVVMVEtepLB5R1ZNU09PhLeUV0tXSlhGa6Wwek1RU01WR3msqmxMU1FPVUmFrKprSlRQUVNLd62qe0ZZS1ZNVVGiqKJSVE5VTVdId6yolEtWTVZNWEiDrKmQSVhNVk1YSW6qqJtSU1FTUVNRWKKmqmZMVk9VUFVOY6elp2FOVVBUUVVOZKmkqWFPVFFTUlNRW6SjrX1LV1BVUlNUTnSxnq5gUlJVUVVQV0xyraGsaE5WUVVSVVJUWaSirItOVlFVUlVSVk55r56veE5XUlVSVVJWT2+unq6GT1ZTVVRUVFRVU5Csn617TlhSVlNVVFRWUISvnK59UlVVVFZTVlNXUGKhpqGpbFBXVFVVVVVUVlJeoaahqW9PWVNXU1dTV1NZT3mqoKahaFBaUllSWVJaUVtNcaakoal7UFhVVlZVV1RYU1pOgaihoqiBTltSWVRYVFhVWFVXWZyipKCpdk9bU1lUWVRZVFlTW095qJ+kop5bVldXV1dXV1hWWFVaUnepnaadqG5TWlZYV1hXWFdXWFdZVGumnqWdqItUWlZZV1hXWFdZV1lWWlNspZ+ioKGgaFNbVlpWWldaV1pXWlZbVWOeop+jnaZ7U1xWWldaWFpYWlhaWFtXXFWLpJ6hoJ+ib1RcV1tYW1haWFpZWllaWVpZXpqgn5+gnaN3VF1XXFhcWFtZW1lbWVtZXFhdV4yjnaCdoJ2gZ1dcWVtaW1pbWltaW1pbW1tbWlxZjqOboZuhmqV/Vl5ZXFpcW1xbXFtcW1xbXFtcW1xbXpefnJ+cn5uhkFxdW1xcXFxcXFxcXFxcXFxdXF1cXVtdXJSenJydnJ6aoX9XYFpeW15cXlxeXF5cXlxeXF5cXlxeXF5bZ5qcnJucm5ybnJllXF9dXl1eXV5dXl1eXV9dX11fXV9dX11gXGJYgaCYnJqbm5qcmZ53WmFdYF1gXmBeX15fXl9fX19fX19fX19fYF9gXmJbe5+WnJebmJuYnJeehl1hX2BfYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGFgYWBhYGWWmJiYmZiZl5mXmpacd1xkX2NgYmBiYGJhYmFiYWJhYmFiYWJhYmFjYWNhY2FjYWNhZF9sl5aXl5aXlpeWl5WYlJqIYGRiZGJjYmNjY2NjY2NjY2NjY2NjY2NkY2RjZGNkY2RjZGNkY2RjZWNmYYiYk5aUlZSVlJWVlJWUlZOXc2FnY2ZkZmRmZGZkZmVmZWZlZmVmZWZlZmVmZWZlZmVmZWZlZmZmZmdmZ2ZnZWdlaGN2lZGTkpOSk5KTkpOSk5GTkZORk3NlaWZoZ2hnaGdoZ2hoaGhoaGhoaGhoaGhoaGhpaGloaWlpaWlpaWlpaWlpaWlpaWlpaWlqaWpqamppbIyQj4+Pj4+Pj4+Pjo+Oj46Pjo+Nj42ReWhtamxqbGtsa2xrbGtsa2xsbGxsbGxsbGxsbG1sbWxtbW1tbW1tbW1tbW1tbW5tbm1ubm5ubm5ubm5ub25vbm9ub25vbnBucG1/jIiKiYqJiomJiYmJiYmJiImIiIiIiIiIiIiIh3RxcnFycnJycnJzcnNzc3Nzc3NzdHR0dHR0dHR1dHV1dXV1dXZ2dnZ2dnd3d3d3eHh4eHl5eXp6e3x9fH18fXx9fH18fXx9fH18fXx9fH0=",
  pickup1 : "haezvL6+ua+ZX0pAOzpASGKbsLm+v7qwl1xJPTs6RE5/rLa+v7qxllpHPTo9Rl6asru/vLSdYEY+OT9Haqa1vr+4rHdIQTg/RWmlt76+tqJiRT06QlOStbvAt6dnRTw7Ql+itsC7tYpNQThAUJO0vr21kE4/OUFZobfAua1sQjs+S4m3vb2vcUI9PE+Pu7u+oV48Pj1srL28s3ZAPTxgpry9tHk/PjxnrL68qmA8PEePvLy5fUA9P3i4u7yEQj0+erm7uno+PUaTvb2rWTs8ZLS7u3Y+PFCkvb2KPz5Inby+hT89UKe9unM6PWi7uqtLP0Gdur5yPjmAusCJQThuuL+VRDlot8COQDpzvrt9N0OIxq1lL16px4xCOoLCr1wzZra+fDVPoceJPUOZxpM/QZTHk0BDmcaFOE6owm40Yr2vVDeFx5A5U7G6XzWAxpA4WLixTj2cwms0isZ9MnPEkjVqw5g3ZsOYN2nEkjVxx3s0fsdrN567TEy6nTdxxnY3orRDWsWCNJO9SFzFeTWisT1zyFtNwoI4rqM3jb1AccJPV8ZfUMVxQsFzQsFxRMNvSbivur2/vLSnek1GOjw6Rk+AqrS9vr60qnpNRTo7PUhdm6+8vcC1rX9PQjs6QUl2qbW+v7mwjVJEOztBTYKvt8C8tqJoREA4QUh9rbjAvLSXVkM6PENdnre9vradWkQ6PUNqqbfAurN/SUA5QlactcC7tIZKPjpCYae3wbiqZUI6PkyOt768r3JBPTxRlLq8vKNgPD4+aKq+vLR4Qj08WqO9vbV5QT47Zau8vqtiPT1Ehbq8uohEPT1ss7y9kUc9PGy0vLyJQj1AhLu8tGg7PVWqvL6HQT1GlL69nEc+QIy8vpdFPUSVvryJPT5Usrq3XD87h7u/iUE5Z7W/oEk6U6nBqFM2VKjDoU81Xq/DlEU4cru8fDdFjcikVzJmtMB2OEmbx5VDPInGo082fcKrVTR4wqxUNXvDqE45j8WWPEqmw3gyZr6rTjqNx4Q1X7ytSz+ew20ze8aON128qENOtrBNQKq2UD+nt09BqrRJR6+vQFe/lzdpxYEyjMJaQbKoOmfGeDWcuEZYw3g2orI/ZcVkP7SbNJG7RGjJYEvBgDiykjKdqTOXrDaDujqDuDqHtTaOsqnBu8G3sZdhSUE6Oz5JX5muub6/urKbYUk/OjtCTHeqs7+9vbGiZUk+OztFVI+vub++tqlySUE5PURalbS6wbm0jlRDOzpDVJC0usC5sH9KQjhARnWsuMC7s4xOQjhASHyxucG4q25DPTpEZaq2wrivbEY7PUNzrru+uZhUPzo/XKK5vruhWz87P1yivL26kk89PER9try+qWY8Pj1vr729rWg9PT91tby9nlM8PE6Xvby0bz09Qoa6vLl/Pz1Bhrq8tW88PkiXvb6jUjw9aLW7unY9PVCkvryKPz1Lo7u+hkA7U6m9unY6PmO5uq5PPz+Wu755Pzl3ucCTRDhltcCeSTdfscKWRThquL+IPD59wrVxMlCZyZhMNXK7umo1UqfEizxDk8iYRjuJxaFKOITGoko5h8eXQkGZxos4Uq6/bzFwwqNHP5bGejNowaVERae/YzSGx4Q0Z8GgPVe8qEVIsq5IRrCvR0iyrEFQt6U6YcOLNHXGdTSXvlBIuZ02c8dsOaewPmXFazusqjlzxFhHvIgznrI9dcdTVsRrP7qFNaqdM6OhM5GxNZGvNZWrMp2nqMK7wbawk11IQDo7QEljna+6vr+5sZZcSD47O0NOfay0v768sZ1gRz46PEVYlbC6v761pmxHQDk+RF+btbvBubKJUEM6PENYlrW7wLiueElBOUFJe663v7mwhUxCOkJMg7G4vrWmaEU/Pkhsq7S/tKlnSD1CSHqtuLm0kFNDP0Rko7W5tZlZREFFZKO2t7OKT0NCTYOytbegY0NFRnistbWjZERFSX2wtLSUVEVEW5yztKhrRkdNi7KzrXVHR02LsbKpakdIVZixspdVSEl2ra+scEhJXqGwrn1KSlqgrrB9TElhpK6qcElMcK2snVVNUZesrXJNS4CrroZQSnGorY9TS2ymrYpRTXWqqn9MU4KwoG9HZJixildNe6qja0ton6qBTlqRrolVVIusj1hUh6yPWVWJq4dUW5OpgFBnnqJvUHuojllckaZ1Unamj1lhmZ9pVYele1N2o4pXbqGPXGackl1lm5JdZ5uQW26di1p0oH5af590XY6XZGmahlx9nHBiko5ge5pwZZOKYYGWa2yWe2OMjGR/lGt0lHJskntpj4JoioNohodqhYZrhYRthYSFiYeHhYN+eXh6fH18fXx9fH18fXx9fH0=",
  pickup3 : "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0ci7h0I0KCkuO2axwdHQzr+iUToqKik5TJy+zc/RwrNpPC4pKDZCibvJ0NHFun1AMikoMz55t8bP0ci8ikU0KigxO26zxM/Qyb2SSTUrKDA7Z7DDztHJv5BJNispMDtmr8TO0cm+kEg1KykxPG6zxM7Qx7yGQzUqKjNAe7nF0M7Gtnc9NCgsNEeLvsbRzMSsZDgxJy82VZ7CydLIwZtSNS4oMjttscXN0MW5ekAzKiw1SI+/x9HKwqVdNzAoMjlnrcPM0Ma6gkE1Kiw1SpC+x9DKwqFXNzAoMztxs8TNzsS0dDw0KTA2V6LCydDGvYdGNSwsNkeKvsbQyMGdUjcvKjQ/fbnEz8rDp105MSkzO3Gzw83Mw65oOjIpMjpmrcPMzcOzcDszKTI5Zq3CzM3Dsmw8MyoyOWeuwszMw7FqOzMqMztqsMPMzMKtZjkyKjU9drXDzcnBo1g5MCs2QoC7xM/GwJNMOC4uN0yUv8bOxLt+QjYsMTpeqcHKy8KtZTszKzU/d7jDzce/l004Li83UZu/x83Dtnc+NSs1PG+zwszHwJtROS8vN0+YvsfNwrZ2PTUsNT5ztsLMxr6VTDguMTpYo8DJysCrYjozLThHi73EzcK4ez82LDY+dLbCzMW8jkg4LjM7Z6/Ay8e/mlA5LzE6WKTAyMm/p1w6MjA5Up6+x8nAq2E6My46S5W+xsrArGI8My85S5S+xsrArGE8My86TZa+xsq/qV48MzA6UZu/xsm+pVg7MTI6W6a+yMe9nVI5MDM8ZK6/ysS8jEc5LzY/d7XBy8G3fUA3LzlFibzDyr+tYjw0MTtWo77Ixb2WTDowNj5ytcDKwbZ2QDcwOkqUvMXIvqNXOzI0PWavv8nBuIBCODA6SpO7xce+oFQ8MjU+bLK/ycC2d0A3MTtRnbzGxLyUSzswOEJ9uMHIvqlePjM1PWWuvsjAtnlAODI8Up68xsO6kEk6MTpHjLvCx7ugVDwyOEF6t8DHvqhcPjM2P2uxv8i+sGc+NTU+Z6+9yL6zcT83ND5eqr3Hv7RyQDc0PV+rvMe/tHBBNzU9Yqu8x76zcj83NT9hrL3HvbFsPzY2QGiwvse8rGM+NThCc7W/xrukWD00OkaHuMHDu5JLPTM9TZm6xMC3gUM6ND9ap7zGvbBsPzc4QXW0vsW6oVM+MzxIjbnCwbiCRTs1P1you8W8rmc/NjpDfra/w7mWTD00PlSiucW8sm5BNzlCerW+w7iXTT01P1WiusS8rmVBNztEf7bAwbiIRjw2QGGrusS6p1o/Nj1LlLnCvrNxQjk5Q3u1vsG3j0g9NkFgq7vDuaFUQDU/Up+4w7utYUI2PkiRt8K8s3BEODxEg7TAvrd9Rjo7QXeyvr+4iEk8OkBsr73AuZFMPTlAZau8wLmWUDw6P2Oovb67k1A9Oj9lqby/upZQPDpAZKi9vrqPTjw7QGqtvb64jkw8PEF0sL2+toRHPDtFfbS9vbJ4Qj07SoS5vL6raz89PFOSvLu9oF49PT1foL27u5FRPD5AdK+9vLSART08Soe4u72nZj89PViavLu7lVQ9PkFzrry8s35FPj1Mirm6vKJgPj8+Zaa8u7eESj4+SYG2u7unaD4/Pl+gvLq4ikw9PkiDtrq7pmQ/Pz9jpbu6toJIPz5Niri5u55cPkBBb627urB1Qz8/V5m6ubiOTj8/Soa2ubufXT9AQm+turquckJAP1yeu7i2gElAP1CRuLm4lVM/QEiEtLm6nlxAQERzsLm6pmZBQUFqqrm5rnNCQkBjpLm4sXxFQj9dn7i4s4FHQUBZm7i4tIVJQUBWmLi4tYhLQUFUlri3tYZLQUFUlbi3tYJKQkFXl7i3s4FIQkFcnre3sXhHQkJfoLi3rnNEQ0JoqLe4qGlDQ0RwrLe3o2FCQ0h+sra3llVCQk+Ntba1hkxDQluctravdUZEQ2motrelZkNER3mwtrWYV0NDUpK1tbJ/SURDZaW1tqdnRERIfLG1tpNTRERVlba0sHlHREVqqbW2nFtERE+MtLSygkpFRGSktbSkZERFTIezs7OFTEVFYqO0taFgRUVOibOzsYJKRkVtqbS0nFtFRVWVs7Osc0dGSHeus7ONUEZGX5+0s6JhRkZQirOyrndIR0h1rbKzjlBHRWWjs7OfXkZGVZWysqpwRkhLgrCysH1LSEhwq7KyjlFIRmeksrKbW0ZHWZqysqNjR0dUkrGxqW9HSE6GsbGtdklJS4CvsK97S0lKeq2wr4VNSUlxq7CwiU9JSW+qsLCKUElJbqmwsYtQSUlvqa+wilBKSXCpr7CIT0pJcqqvr4VOSkp2rK+ugk1KTHqtr6x8S0pPha6vqXBLSlKNr6+laEpKV5Swrp9gSkpioK6wklZLSmynrq6IUEtMfaytq3ZLTFGJrq6iZUtKXJmvrphaS0tspa2uhVBMTXysrahwTExVka6um11MS2aira2JUkxOfqysp3FMTFmWra2YW0xMb6esq3pOTVKKrK2dYU1MZKCsrIVRTlCAq6ujaE1NYp6rrIxTTlCAq6uiaE5NYZysq4lST1GFqqufZU1OZaCrq4FQT1SMq6uaX05ObaWqqHdOT1qWqquOVk9RgamqoWlOT2ehqql9UFBYkaqqkVhQUH6pqaBlUE9so6ind1FQXZipqohUUVSKqamWXFFQeaeooWhRUGqhqKd2UVFfmaiphVNSV46pqJFYUlOCqKeYX1FSfKannWRSUXKkp6JuUVJooKeldVJRZp6mpnlSU1+Yp6aBVFJel6ang1RTW5KnpoZWU1uSpqaIVlRZjqamh1ZUWY6mpodXVFqQpqaIV1Rck6WmhVZUXpSlpYFVVV6VpaR8VFVimaSjdlRVZ5ykoXBUVW2fpJ5pVVV0oqSZY1VWgKOkk15WWYmjpItaVl2So6OBV1ZkmaOgclZWbZ6inGhWV32iopRfV1qJo6OEWFhhlaKhdldXb56hmWZYWH2hoo9dWF6QoaF7WFhrnKCdbFhYe6Ghj15ZXpCgoHlZWG6dn5ppWVqAoaCKXFpjlZ+ecllZd5+fkWBaXo+fn3laWXGcn5VkW12Jn59+W1ptmp6XZ1tch56fgFxbbJqel2dcXYaenoBcXGyanZZnXF6Hnp1+XFxwmp2QY11hj5ycdFxceZyci2BdZpOcl2tdXoWcnH9dXXCZm5FlXWSQm5lxXl5+m5uEX15wmJqRZF9jjpuYcF9fgpqagF9fc5iajGNgZ5GalGtgYYiZmXhgYH2ZmYNhYHKXmI1kYWiRmJNqYWOJmJZyYWKBmJd7YWF4l5eDYmJxlpeKZGNrkpaPaGRnjpaTbGRkiZaVcWRjg5WWd2RjgZWWe2RjfZSWgGVjeZSWgGZkdpKWg2dkdZKVhmhkc5CVhmllcY+Vh2pkc4+UiGtlco6UhmtldI6Th2tmc46ThWtmdY6ShWtndY6SgmtneI+RgGpoeI+QgGppe4+PfWlrfpCNemlsgJCMeWlugZCKd2lwhJCHdGlzho+Ecmp2iI6BcGx5iox+bm59i4p7bnCAjId4bXODi4R1bneFioFzb3qHiX1ycn2IhnpxdICHg3hyd4KGgHd0eoOEfXZ3fYKBe3h6fn58fXx9fH18fXx9fH18fXx9fH18fXx9fH18fXx9",
  shoot0: "az5PZz5TYz9LSEZNSUNpR0duQ0trP09hQE9WQFFVP1NTPl1WPGVSPmtPQGxIRllGRUpIQ2VOQG5GSElNPmxPQ1hMP2BYPWBTPFxfP05MQVJpPkthSEVQRUVlUjtkXDtXZz5MZElCYVA/Wlo9Ul9CSGZKQGZYOl9hPVFkQ0hMTUBVaD5MZ0lCU1ZBTmtCSE1SPlVmRENdWjxUVEdBZlY9UGdJQFpdQEpaTUFRUkVGVE5CS1pLQFZgQ0RjWTxRZkw+XF5DRFlhPkpkVjtTWU89VmRJQFZXSj1mV0ZBY1pDRGJaQElnT0NJa0pFR2xIR0VuR0lCbExJP2lVRUJlV0NEZFpAR1RrPUtObjhRP3g/Tz55Qk87aVRFRFRrPkxDd0RMPnNZQ0VYdTlRPXxFTT1iXUFISm8/Tj10XT9LRXI/UDtzYj9MRHFES0BbbjtRO4NZQkhMgEBOPWNzOlI5fGY8Tz+IUURJR3FFSUNScz5OPl52PE89YWk9Tz5bZD5PPWZwOlI5bXo5UjtmfztQPll4QkpFSm5IRklDeFg+UDt7ZjxQPV52P0xES2xMQ00+cmM8UD1egEFKR0R1XTxRPldpSERNPHluOlE+VoFJRE09ZoI8TUVGZ188UEBPb1Q+UT1YbkxBUD1cbElDUDpogUJHTT1vcj5LSUFkhjpPREhSjD1PQktKh0BPQFA9j1BJQ086hGZASklAb303Uz5QQZZHTUFQOnV3PE9DTEeTTElFTT5rhDlSP1E9kFVFSUhGU5hISkRNPmyGOFM9Uzh6dDtQQVA7gHI6Uj5TOYiCOlFAUTp0ejlSQFE9ZIpATEVLRVCTTkVLRU0+hGY7Uj9SOnKVQE1FSkhFiF09UT9SO2WHREhLRFA7f3A9TkVJSUWhaz1PQ0xFTJFVQ0xFS0VQlE5HSUlHSkihXENLSEhKR6dgQ0pJRk49ioo5UkJNRkZfqz9RQFBBUT+lY0NKSUdLQ16oR0xFTUNQO4CVOVNAUEFRPZ93PVBDTkNQPJd8OlJBUEFSOpKDOlJBUEFSO4ibQE9ETUVNQlunT0dLR0xFTz6VgjpSQU9DT0Bhs2JAUEJPQlI7fLBPR0tGTUNQPYGgQ0xHSUpHTUB9sUdMRktISUpFZrpSSkZMRU1ET0CkkD5PRUxHSkpFY7tWSUhLR0xFTkGHrUtLR0tHTEZOQYmtRk1FTUVNRFA+j6dETkVNRkxGTkFvvWpDTUZMRk1FT0CglUBPRUxHS0hLRlm6iEJNR0tIS0hLRlu7fkJNR0tIS0hLRly7hEJNR0tISklJS0ieq0pMR0xIS0hLSUhZvYZETEhKSUpKSUpHXbqNQ01HS0hLSEtJSlG0lERNSEtIS0hLSE1Ei7pYSEpKSUpJS0hMRV2zpU9JSkpKSklKSUtHVa2tV0ZMSEtJS0lKSUpMobdkQ05GTUdNR01GTkNlsK1aRUxIS0lLSUtITEVetKZTRkxITEhMSExITEdQn7lpRktKSktJTEhNRlBBbrSvY0NOR0xJS0pKS0hNRGizrmlBUEVORk5HTUdORk9CjrmcSktJS0lLSUtJS0lLSkyVuZ5PR01ITUdNR05GT0VSP4Cxs21CT0hMSUtLSkxITUdQQHqzsn0+UkVPR01ITElMSkpMRmO0rKlLTkdOR05HTkdOR05GUENgqrScSUtLSktKTElMSU1ITkdPRZ6utXlCT0hNSUxKS0tKTElNR1BBf7WvmUJRRk9HTkhOSE1ITUhOR09Gn6+ymkZOSE1JTEpMSkxJTElNSE9DdLmntWBHTUpMSktLS0tLS0tKTEpNRmO1p7eORU5JTEpMSkxKTEtLS0tLS0xJVa6ssqFNS0tLS0tLS0tLS0tLS0tLSk1IXrKptJ1NS0xLTEtMSkxKTEpMSk1JTkhQQ3i4gX18fXx9fH18fXx9fH18",
  shoot1: "kMbNjSc6KZnLzJ0qOCqYzsivNDUpetHCyFItMErDxNCNKzgpf9DCzWgpNjGhzcXFVSw0M6HOw8poKDgrhM/B0IYsNypVv8jIv1UrNyt5zcLOqkAvNS5/zsHOrkcsOCptxsfGx2srNi5Apc3CzK5JLTYtULbJxcquQzEzMUKsycbHwF8vMzMxc8nDysWwQzQwNjGDx8XHyLBKMjI0MGLAxMnDyH8zNTE1NIDGxMnDxnszNTE2MWu/xMjEyaVJMjQyNDmHxsPIw8mkTDI1MTYzaLnGxcfEw4U6NDMzNDZyvcTHxcbDmkQ2MjUyNUWYwcbFxsTDkkQ2MzUzNTt1usPHxMfDvX89NjM1MzY5bLLCxsTGxMOpXjk1MzUzNjplqsHFxcTFxL2QSjkzNjQ1ND1Xn73FxMXDxsG1fkM5MzYzNjM7Soa2wMbDxsLGv7N9Rjo0NjQ2NTZAWJm3wcXDxMPFwreaWUE2NTU2NTY1QVGKsbvFwsTDxMPCtKBjRTo1NjU2NTY3RFCArbbDwsTDxMPDv7OiaklANjc1NzY2NjlET3Klr73BxMLEwsTCwbSriFdIPjc3Njc2NzY5PkpUeqSuub/DwsLCwsLCvrWrlWNPRT04Njc3Nzc3Nz5DTld6oaq0usDCwsLCwsLCvrivpZFjUklBPDg3Nzg3ODc5PUNIUlt7naWvtLq8wcHCwcLBwr67tK+kmnZaUklEPzw5ODg4ODg6PEBDSE1WXXSWoKitsra5u77AwcHBwL68ubWwq6OchWNaUUxHREA/PTw7Ozs8PT9BQ0ZKTlNaYHGQmaGmqq2xs7W2ubq8vL28vLq5trSwraejm5R5Y11WUk1LR0ZDQkFBQEBAQUFCREVHSUxPUlVZXmRth5SZnqGlp6qsrq+wsbKzta6egXx9fH18fXx9fH18fXx9fH19fX19fX19fX19fX19fX19fX19fX19fX19"
};
