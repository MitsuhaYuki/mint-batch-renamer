export interface IFileItem {
  full_name: string
  name: string
  size: number
  extension: string
  path: string
  // after renamed will add following attrs
  rename_full_name?: string
  rename_name?: string
  rename_extension?: string
}
