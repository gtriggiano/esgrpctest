'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getLastSnapshotOfAggregateFactory(getConnection) {
  return function (_ref) {
    var aggregateIdentity = _ref.aggregateIdentity;

    var results = new _eventemitter2.default();

    var queryString = 'SELECT * FROM snapshots\n                    WHERE aggregateId = $1\n                      AND aggregateType = $2\n                    ORDER BY version DESC\n                    LIMIT 1';
    var queryParams = [aggregateIdentity.id, aggregateIdentity.type];

    getConnection(function (err, _ref2) {
      var client = _ref2.client,
          release = _ref2.release;

      if (err) return results.emit('error', err);

      var query = client.query(queryString, queryParams);

      query.on('row', function (row) {
        return results.emit('snapshot', {
          aggregateIdentity: {
            id: row.aggregateId,
            type: row.aggregateType
          },
          version: parseInt(row.version, 10),
          data: row.data.toString()
        });
      });
      query.on('error', function (err) {
        results.emit('error', err);
        query.removeAllListeners();
        release();
      });
      query.on('end', function () {
        results.emit('end');
        query.removeAllListeners();
        release();
      });
    });

    return results;
  };
}

exports.default = getLastSnapshotOfAggregateFactory;