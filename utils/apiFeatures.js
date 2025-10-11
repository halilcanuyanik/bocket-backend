class APIFeatures {
  constructor(queryObj, monQuery) {
    this.queryObj = queryObj;
    this.monQuery = monQuery;
  }

  filter() {
    const copiedQueryObj = Object.assign({}, this.queryObj);
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete copiedQueryObj[el]);

    let queryStr = JSON.stringify(copiedQueryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.monQuery = this.monQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(',').join(' ');
      this.monQuery = this.monQuery.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(',').join(' ');
      this.monQuery = this.monQuery.select(fields);
    } else {
      this.monQuery = this.monQuery.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 5;
    const skip = (page - 1) * limit;

    this.monQuery = this.monQuery.skip(skip).limit(limit);

    if (this.queryObj.page) {
      const numOfEntities = this.monQuery.model.countDocuments();
      if (skip >= numOfEntities) {
        throw new Error('This page does not exist!');
      }
    }
    return this;
  }
}

module.exports = APIFeatures;
