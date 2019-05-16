export default class Highlighter {
  static keywordReplacements = new Map();

  static mark (originalStr, keyword) {
    if (!originalStr || !keyword) {
      return originalStr;
    }

    let searchAndReplace = [];
    if (Highlighter.keywordReplacements.has(keyword)) {
      searchAndReplace = Highlighter.keywordReplacements.get(keyword);
    } else {
      let keywordSet;
      if (keyword instanceof Array) {
        keywordSet = keyword;
      } else {
        if (keyword.indexOf(' ') !== -1) {
          keywordSet = keyword.split(' ');
          keywordSet.unshift(keyword);  
        } else {
          keywordSet = [keyword];
        }
      }  
      for (let keyword of keywordSet) {
        searchAndReplace.push({
          search: new RegExp(keyword, 'ig'),
          replace: '<span class="bg-warning">' + keyword + '</span>'
        })
      }
      Highlighter.keywordReplacements.set(keyword, searchAndReplace);
    }

    if (originalStr.match(searchAndReplace[0].search)) {
      return originalStr.replace(searchAndReplace[0].search, searchAndReplace[0].replace);
    } else {
      for (let keyPair of searchAndReplace) {
        originalStr = originalStr.replace(keyPair.search, keyPair.replace);
      }
      return originalStr;
    }
  }
}