// A simple, generic, in-memory TTL cache.
// It stores promises to prevent request waterfalls and ensures that for a given key,
// the data-fetching function is only executed once within the specified TTL.
