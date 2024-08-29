class APIFeatures {
  // Data (Properties)
  query;
  queryString;

  // Constructor to initialize properties
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Filtering
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "limit", "sort", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-ratingsAverage");
    }
    return this;
  }

  // Field Limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // Pagination
  async paginate() {
    const page = Math.max(this.queryString.page * 1 || 1, 1);
    const limit = Math.max(this.queryString.limit * 1 || 100, 1);
    const skip = (page - 1) * limit;

    this.totalDocuments = await this.query.model.countDocuments();
    const totalPages = Math.ceil(this.totalDocuments / limit);

    if (skip >= this.totalDocuments && this.totalDocuments > 0) {
      throw new Error("This page does not exist");
    }

    this.query = this.query.skip(skip).limit(limit);

    this.pagination = {
      currentPage: page,
      totalPages,
      limit,
      totalDocuments: this.totalDocuments,
      next: page < totalPages ? page + 1 : null,
      prev: page > 1 ? page - 1 : null,
    };

    return this;
  }
}

module.exports = APIFeatures;
