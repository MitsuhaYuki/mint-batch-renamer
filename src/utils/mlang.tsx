import { ConfigContext, IConfigReducerAction, IConfigState } from '@/context/config'
import { useCallback, useContext, useEffect, useMemo } from 'react'
import zhCN from '@/locale/zh-CN.json'
import enUS from '@/locale/en-US.json'
import { MultiLangField, MultiLangs } from '@/types/mlang'

interface ILanguage {
  name: string
  id: string
  data: any
}

const langs: Record<string, ILanguage> = {
  'zh-CN': {
    name: '简体中文',
    id: 'zh-CN',
    data: zhCN
  },
  'en-US': {
    name: 'English',
    id: 'en-US',
    data: enUS
  }
}

const fmlNameMaker = (name: string, inheritName?: string): string => {
  return inheritName ? `${inheritName}.${name}` : name
}

const fmlField = (field: MultiLangField, config: IConfigState) => {
  return field[config.system?.lang ?? Object.keys(field)[0]]
}

const useMultiLangLoader = (
  configState: IConfigState,
  configDispatch: (data: IConfigReducerAction) => void
) => {
  useEffect(() => {
    if (configState.system?.lang && (configState.system.lang !== configState.langs.id)) {
      configDispatch({ type: 'u_langs', payload: langs[configState.system.lang] })
    }
  }, [configState])
}

const useMultiLang = (
  state: IConfigState,
  name: string,
  inheritName?: string,
): {
  fmlName: string,
  fmlText: (key: string, ...params: string[]) => string
} => {
  const fmlName = useMemo(() => fmlNameMaker(name, inheritName), [])

  const fmlText = useCallback((key: string, ...params: string[]) => {
    const sectionKeys = ['common'].concat(fmlName.split('.'))
    let lang = state.langs.data
    let target: string = ''

    const langKeys = key.split(':')
    if (langKeys.length === 2) {
      const section = lang[langKeys[0]] ?? {}
      if (Object.keys(section).find(v => v === langKeys[1])) {
        target = section[langKeys[1]]
      }
    } else {
      for (let i = sectionKeys.length - 1; i >= 0; i--) {
        const section = lang[sectionKeys[i]] ?? {}
        if (Object.keys(section).find(v => v === key)) {
          target = section[key]
          break
        }
      }
    }

    if (target) {
      params.forEach((v, k) => {
        target = target.replace(`{${k}}`, v)
      })
      return target
    } else {
      console.warn(`[MultiLang] key '${key}' not found.`)
      return 'N/F'
    }
  }, [state.langs])

  return {
    fmlName,
    fmlText
  }
}

const useMultiLangWrapped = (
  name: string,
  inheritName?: string
): {
  fmlName: string,
  fmlText: (key: string, ...params: string[]) => string
} => {
  const { state } = useContext(ConfigContext)
  return useMultiLang(state, name, inheritName)
}

export {
  langs,
  fmlField,
  fmlNameMaker,
  useMultiLang,
  useMultiLangLoader,
  useMultiLangWrapped,
}
export type {
  ILanguage
}