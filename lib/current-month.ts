export function getCurrentMonth() {

  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  )
    .toISOString()
    .split('T')[0];
}