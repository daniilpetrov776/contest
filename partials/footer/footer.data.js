export const footerContext = {
    logo: {
        text: 'Only',
        href: '/',
        ariaLabel: 'Only — на главную',
    },
    contacts: {
        email: {
            value: 'hello@only.digital',
            href: 'mailto:hello@only.digital',
        },
        phone: {
            value: '+7 (495) 740 99 79',
            href: 'tel:+74957409979',
        },
        telegram: {
            class: 'footer__contacts-link--static',
            icon: 'telegram-icon',
            tip: 'telegram для связи',
            label: '@onlydigitalagency',
            href: 'https://t.me/@onlydigitalagency',
        },
    },
    social: {
        title: 'Социальные сети',
        items: [
            { name: 'be', href: '#', ariaLabel: 'Behance' },
            { name: 'dp', href: '#', ariaLabel: 'dp' },
            { name: 'tg', href: '#', ariaLabel: 'Telegram' },
            { name: 'vk', href: '#', ariaLabel: 'Vkontakte' },
        ],
    },
    copyright: {
        text: '© 2014 - 2024',
    },
    policy: {
        title: 'Политика конфиденциальности'
    },
    about: {
        title: 'Презентация компании',
        items: [
            { text: 'pdf', href: '#' },
            { text: 'pitch', href: '#' },
        ],
        description: 'Презентация компании',
    }
}
