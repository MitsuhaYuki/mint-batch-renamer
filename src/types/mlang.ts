import { langs } from '@/utils/mlang'

interface MultiLangProps {
  inheritName?: string
}

type MultiLangs = keyof typeof langs

type MultiLangField = Record<MultiLangs, string>

export type {
  MultiLangs,
  MultiLangProps,
  MultiLangField
}