import * as fs from "fs";
import genLocales from "./locales.js";
const generateLanguages = configObject => {
  const languages = {};
  Object.keys(configObject).forEach(key => {
    Object.keys(configObject[key]).forEach(language => {
      if (!languages[language]) {
        languages[language] = {};
      }
    });
  });

  Object.keys(languages).forEach(language => {
    Object.keys(configObject).forEach(key => {
      languages[language][key] = configObject[key][language];
    });
  });
  return languages;
};

const languages = generateLanguages(genLocales());

console.log('languages', languages);
let keys = 0;
Object.keys(languages).forEach(language => {
  keys = keys + 1;
});
Object.keys(languages).forEach(language => {
  Object.keys(languages[language]).forEach(key => {
    keys = keys + 1;
  });
});
console.log(languages.es);

const keyValues = [];

const spanish = languages.es;
const english = languages.en;
Object.keys(spanish).forEach(key => {
  const cat = key;
  keyValues.push({ category: cat, ...spanish[key] });
});

console.log("nestedKeys", keyValues);

let csv = "category, key, value, english\n";

keyValues.forEach(obj => {
  const cat = obj.category;
  delete obj.category;
  Object.keys(obj).forEach(key => {
    //find the english value
    const eng = english[cat][key];
    csv += `${cat},${key},"${obj[key]}","${eng}"\n`;
  });
});
fs.writeFileSync("es.csv", csv);
