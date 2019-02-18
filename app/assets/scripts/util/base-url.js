if (process.env.NODE_ENV === 'development') {
  module.exports = 'http://localhost:3000';
} else if (process.env.NODE_ENV === 'staging') {
  module.exports = 'http://rdr2019build.cloudtech.company';
} else {
  module.exports = 'https://rankingdigitalrights.org/index2019';
}
