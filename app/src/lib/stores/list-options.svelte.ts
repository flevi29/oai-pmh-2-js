export function getListOptionsStores(key: string) {
  key = key.toLowerCase();

  const FROM_KEY = `${key}-from`;
  const UNTIL_KEY = `${key}-until`;
  const SET_KEY = `${key}-set`;
  const METADATA_PREFIX_KEY = `${key}-metadata-prefix`;

  let from = $state<string>(localStorage.getItem(FROM_KEY) ?? "");
  let until = $state(localStorage.getItem(UNTIL_KEY) ?? "");
  let set = $state(localStorage.getItem(SET_KEY) ?? "");
  let metadataPrefix = $state(localStorage.getItem(METADATA_PREFIX_KEY) ?? "");

  return {
    get from() {
      return from;
    },
    setFrom(value: string): void {
      from = value;
      localStorage.setItem(FROM_KEY, value);
    },
    get until() {
      return until;
    },
    setUntil(value: string): void {
      until = value;
      localStorage.setItem(UNTIL_KEY, value);
    },
    get set() {
      return set;
    },
    setSet(value: string): void {
      set = value;
      localStorage.setItem(SET_KEY, value);
    },
    get metadataPrefix() {
      return metadataPrefix;
    },
    setMetadataPrefix(value: string): void {
      metadataPrefix = value;
      localStorage.setItem(METADATA_PREFIX_KEY, value);
    },
  };
}
