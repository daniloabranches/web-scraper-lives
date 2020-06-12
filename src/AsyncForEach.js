class AsyncForEach {
  static async each(array, callback) {
    for (let index = 0; index < array.length; index++) {
      const result = await callback(array[index], index, array);
      if (result === false) {
        break;
      }
    }
  }
}

module.exports = AsyncForEach;
