import { langs } from '@/utils/mlang'

interface MultiLangProps {
  inheritName?: string
}

type MultiLangs = keyof typeof langs

type MultiLangField = Record<MultiLangs, string>

type MultiLangOption = {
  label: MultiLangField
  value: string
}

export type {
  MultiLangs,
  MultiLangProps,
  MultiLangField,
  MultiLangOption
}