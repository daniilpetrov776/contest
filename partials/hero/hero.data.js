export const heroContext = {
    video: {
        text: 'Only digital',
        icon: 'star', // Используем существующую иконку star
    },
    socials: [
        { number: '25', icon: 'socials-w', width: 25.85, height: 25.85, class: 'hero__socials-icon-wrapper--w' },
        { number: '1', icon: 'socials-fwg', width: 37, height: 11, class: 'hero__socials-icon-wrapper--fwg' },
        { number: '26', icon: 'socials-arrows', width: 23.1, height: 23.1, class: 'hero__socials-icon-wrapper--arrows' },
        { number: '22', icon: 'socials-pointer', width: 20, height: 26, class: 'hero__socials-icon-wrapper--pointer' },
        { number: '40', icon: 'socials-human', width: 29, height: 30, class: 'hero__socials-icon-wrapper--human' },
    ],
    footer: {
        left: {
            years: '10',
            yearsLabel: 'лет',
        },
        center: {
            email: 'hello@only.digital',
            phone: '+7 (495) 740 99 79',
            tel: '+74957409979',
            telegram: {
                label: 'telegram для связи',
                username: '@onlydigitalagency',
            },
        },
        right: {
            description: 'Only.digital — агентство с фокусом на сильную аналитику, дизайн и разработку. В основе наших проектов лежат идеи, создаваемые на стыке стратегии, креатива и технологий.',
            about: [
                { text: 'pdf', href: '#' },
                { text: 'pitch', href: '#' },
            ],
            button: {
                text: 'начать проект',
                href: '#',
            },
        },
    },
}
