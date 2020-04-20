const schema = "";
const groupName = "";
const groupId = 2;
//'Surname Name'
const studentNames = [];

const set = new Set();
const students = studentNames.map(sn => {
  const [surname, name] = sn.split(" ");
  const [transName, transSurname] = [transliterate(name), transliterate(surname)];
  const username = `${transName}.${transSurname}`;
  const accessKey = `${groupName}-${removeSpecial(surname)}`;
  if (set.has(accessKey)) {
    console.error(`${accessKey} is duplicated.`)
  } else {
    set.add(accessKey)
  }
  return {
    "username": username,
    "password": username,
    "firstName": name,
    "lastName": surname,
    "email": "",
    "userType": 100, //student
    "accessKey": accessKey,
    "studentGroupId": groupId
  }
});

const sqls = students.map(s => {
  const insert = "INSERT INTO `" + schema + "`.`users` ";
  const cols = "(`username`, `password`, `first_name`, `last_name`, `email`, `user_type`, `group_id`, `access_key`) ";
  const values = "VALUES ";
  return insert + cols + values + `('${s.username}', '${s.password}', '${s.firstName}', '${s.lastName}', '${s.email}', '${s.userType}', '${groupId}', '${s.accessKey}')`
});

sqls.forEach(sql => {
  console.log(sql + ";")
});

function removeSpecial(str) {
  return str.replace(/[’'`]/g, "")
}

function transliterate(word){
  var answer = ""
    , a = {};

  a["Ё"]="YO";a["Й"]="I";a["Ц"]="TS";a["У"]="U";a["К"]="K";a["Е"]="E";a["Н"]="N";a["Г"]="G";a["Ш"]="SH";a["Щ"]="SCH";a["З"]="Z";a["Х"]="H";a["Ъ"]="'";
  a["ё"]="yo";a["й"]="i";a["ц"]="ts";a["у"]="u";a["к"]="k";a["е"]="e";a["н"]="n";a["г"]="g";a["ш"]="sh";a["щ"]="sch";a["з"]="z";a["х"]="h";a["ъ"]="'";
  a["Ф"]="F";a["Ы"]="I";a["В"]="V";a["А"]="a";a["П"]="P";a["Р"]="R";a["О"]="O";a["Л"]="L";a["Д"]="D";a["Ж"]="ZH";a["Э"]="E";
  a["ф"]="f";a["ы"]="i";a["в"]="v";a["а"]="a";a["п"]="p";a["р"]="r";a["о"]="o";a["л"]="l";a["д"]="d";a["ж"]="zh";a["э"]="e";
  a["Я"]="Ya";a["Ч"]="CH";a["С"]="S";a["М"]="M";a["И"]="I";a["Т"]="T";a["Б"]="B";a["Ю"]="YU";
  a["я"]="ya";a["ч"]="ch";a["с"]="s";a["м"]="m";a["и"]="i";a["т"]="t";a["б"]="b";a["ю"]="yu";

  //ukrainian override
  a["є"]="ie"; a["Є"]="IE";
  a["и"]="y"; a["И"]="Y";
  a["ї"]="i"; a["Ї"]="I";
  a["ь"]=""; a["Ь"]="";
  a["’"]="";

  for (i in word){
    if (word.hasOwnProperty(i)) {
      if (a[word[i]] === undefined){
        answer += word[i];
      } else {
        answer += a[word[i]];
      }
    }
  }
  return answer;
}
