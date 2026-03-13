export function formatLocalizedDateTime(
  value: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) {
    return value
  }
  return new Intl.DateTimeFormat(locale, options).format(new Date(timestamp))
}
