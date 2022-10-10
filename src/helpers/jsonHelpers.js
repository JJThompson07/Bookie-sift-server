const fs = require('fs');

const trimName = name => {
  return name.replace(/\s/g, '').toLowerCase();
};

const saveJson = async (data, path, name) => {
  const callback = err => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(`${name} json file saved correctly`);
    return;
  };

  const jsonData = JSON.stringify(data, null, 2);
  try {
    fs.mkdirSync(`./${path}`, { recursive: true });
  } catch (e) {
    console.error('Cannot create folder ', e);
    return;
  }

  await fs.writeFile(`./${path}/${name}.json`, jsonData, callback);
  return;
};

module.exports = { trimName, saveJson };
