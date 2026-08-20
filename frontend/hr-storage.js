/* ================================================================
   HRStorage — shared localStorage layer for all ModernTech HR pages
   ================================================================
   Keeps the real seed data (employee-data.js / hr-employee-data.js)
   untouched and stores only the DIFFS (added / removed / edited)
   in localStorage, so every page rebuilds the same employee list
   and survives a refresh.
   ================================================================ */
(function (global) {
  var STORAGE_KEY = 'moderntech_hr_overrides_v1';

  function loadOverrides() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { added: [], removedIds: [], edited: {} };
      var parsed = JSON.parse(raw);
      return {
        added: parsed.added || [],
        removedIds: parsed.removedIds || [],
        edited: parsed.edited || {}
      };
    } catch (err) {
      console.error('HRStorage: failed to read localStorage', err);
      return { added: [], removedIds: [], edited: {} };
    }
  }

  function saveOverrides(overrides) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (err) {
      console.error('HRStorage: failed to write localStorage', err);
    }
  }

  function idOf(e) {
    return e.employeeId != null ? String(e.employeeId) : e.localId;
  }

  /**
   * Builds the working employee list for a page.
   * baseList = the raw records from employee-data.js / hr-employee-data.js
   * mapFn    = the page's existing function that maps a raw record to
   *            the shape that page's UI expects.
   */
  function buildEmployees(baseList, mapFn) {
    var overrides = loadOverrides();
    var removed = {};
    overrides.removedIds.forEach(function (id) { removed[id] = true; });

    var mapped = (baseList || [])
      .map(mapFn)
      .filter(function (e) { return !removed[idOf(e)]; })
      .map(function (e) {
        var edits = overrides.edited[idOf(e)];
        return edits ? Object.assign({}, e, edits) : e;
      });

    var added = overrides.added.filter(function (e) { return !removed[idOf(e)]; });

    return added.concat(mapped);
  }

  function addEmployee(emp) {
    var overrides = loadOverrides();
    emp.localId = 'local-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    overrides.added.unshift(emp);
    saveOverrides(overrides);
    return emp;
  }

  function removeEmployee(id) {
    var overrides = loadOverrides();
    overrides.removedIds.push(String(id));
    overrides.added = overrides.added.filter(function (e) { return idOf(e) !== String(id); });
    saveOverrides(overrides);
  }

  function updateEmployee(id, changes) {
    var overrides = loadOverrides();
    var addedMatch = overrides.added.find(function (e) { return idOf(e) === String(id); });
    if (addedMatch) {
      Object.assign(addedMatch, changes);
    } else {
      overrides.edited[id] = Object.assign({}, overrides.edited[id], changes);
    }
    saveOverrides(overrides);
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  global.HRStorage = {
    buildEmployees: buildEmployees,
    addEmployee: addEmployee,
    removeEmployee: removeEmployee,
    updateEmployee: updateEmployee,
    clearAll: clearAll,
    idOf: idOf
  };
})(window);