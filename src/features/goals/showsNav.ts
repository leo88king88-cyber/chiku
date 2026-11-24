/** Where the bar appears: the main pages only, never inside a flow or a celebration. */
export const showsNav = (path: string) =>
  /^\/c\/(home|goals|tasks|activity)$/.test(path) ||
  (/^\/c\/goal\/[^/]+$/.test(path) && path !== '/c/goal/new') ||
  /^\/c\/invest\/(sim|learn)$/.test(path)
