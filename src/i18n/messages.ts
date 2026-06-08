import enCommon from '@/i18n/locale/en/common.json';
import bnCommon from '@/i18n/locale/bn/common.json';
import enLegal from '@/i18n/locale/en/legal.json';
import bnLegal from '@/i18n/locale/bn/legal.json';

export const messages = {
    en: {
        common: enCommon,
        legal: enLegal,
    },
    bn: {
        common: bnCommon,
        legal: bnLegal,
    },
} as const;