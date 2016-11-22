'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getEvents = require('./getEvents');

var _getEvents2 = _interopRequireDefault(_getEvents);

var _getEventsByAggregate = require('./getEventsByAggregate');

var _getEventsByAggregate2 = _interopRequireDefault(_getEventsByAggregate);

var _getEventsByAggregateTypes = require('./getEventsByAggregateTypes');

var _getEventsByAggregateTypes2 = _interopRequireDefault(_getEventsByAggregateTypes);

var _getEventsByTypes = require('./getEventsByTypes');

var _getEventsByTypes2 = _interopRequireDefault(_getEventsByTypes);

var _getLastSnapshotOfAggregate = require('./getLastSnapshotOfAggregate');

var _getLastSnapshotOfAggregate2 = _interopRequireDefault(_getLastSnapshotOfAggregate);

var _storeEvents = require('./storeEvents');

var _storeEvents2 = _interopRequireDefault(_storeEvents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiHandlersFactories = {
  getEvents: _getEvents2.default,
  getEventsByAggregate: _getEventsByAggregate2.default,
  getEventsByAggregateTypes: _getEventsByAggregateTypes2.default,
  getEventsByTypes: _getEventsByTypes2.default,
  getLastSnapshotOfAggregate: _getLastSnapshotOfAggregate2.default,
  storeEvents: _storeEvents2.default
};

exports.default = apiHandlersFactories;