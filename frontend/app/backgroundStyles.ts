export const blackIceStyle = {
    backgroundColor: '#030309',

    backgroundImage: [
        'radial-gradient(ellipse 200% 140% at 50% 10%, #162841E6 0%, #1a3c5faa 25%, #0f1e3588 45%, #0c0e1177 65%, #06070d44 85%, #03030900 100%)',

        'radial-gradient(ellipse 300% 200% at 30% 80%, #0a1a2d33 0%, #051222 40%, #03030900 70%)',

        'radial-gradient(circle at 70% 30%, #2a4a6d22 0%, #1b3a5511 30%, #03030900 60%)',

        `url("data:image/svg+xml,%3Csvg width='180' height='90' viewBox='0 0 180 90' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noise' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8 2.4' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .15 0'/%3E%3C/filter%3E%3Cfilter id='grain' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.9' numOctaves='1'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .08 0'/%3E%3C/filter%3E%3C/defs%3E%3Cg stroke='%23175dffa8' stroke-width='1' opacity='.07'%3E%3Cpath d='M0 45H180M90 0V90'/%3E%3Cpath d='M0 15l180 60M0 75l180-60'/%3E%3Cpath d='M0 30l180 30M0 60l180-30'/%3E%3C/g%3E%3Cg stroke='%23205effcc' stroke-width='0.5' opacity='.05'%3E%3Cpath d='M0 22.5l180 45M0 67.5l180-45'/%3E%3Cpath d='M45 0v90M135 0v90'/%3E%3C/g%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' fill='%23ffffff'/%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' fill='%23185fff'/%3E%3C/svg%3E")`,

        `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='crystal' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5 3.1' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .12 0'/%3E%3C/filter%3E%3C/defs%3E%3Cg stroke='%23ffffff' stroke-width='0.3' opacity='.02'%3E%3Cpath d='M0 60h120M60 0v120'/%3E%3Cpath d='M0 0l120 120M0 120l120-120'/%3E%3Cpath d='M0 30l120 60M0 90l120-60'/%3E%3Cpath d='M30 0l60 120M90 0l-60 120'/%3E%3C/g%3E%3Crect width='100%25' height='100%25' filter='url(%23crystal)' fill='%23ffffff'/%3E%3C/svg%3E")`,

        /* #6 Fine surface texture - adds micro-detail */
        `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='micro' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeTurbulence type='turbulence' baseFrequency='4.2' numOctaves='1'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .06 0'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23micro)' fill='%23ffffff'/%3E%3C/svg%3E")`,
    ].join(','),

    /* Enhanced background sizing and positioning for depth */
    backgroundSize: [
        'cover', // Primary frost beam
        'cover', // Secondary atmospheric layer
        'cover', // Tertiary glow layer
        '180px 90px', // Enhanced grid pattern
        '120px 120px', // Crystalline texture
        '60px 60px', // Fine surface texture
    ].join(','),

    backgroundAttachment: [
        'fixed', // Primary frost beam - static
        'fixed', // Secondary atmospheric - static
        'scroll', // Tertiary glow - moves with content
        'fixed', // Enhanced grid - static
        'scroll', // Crystalline texture - subtle movement
        'fixed', // Fine surface - static
    ].join(','),

    backgroundPosition: [
        '50% 10%', // Primary frost beam
        '30% 80%', // Secondary atmospheric layer
        '70% 30%', // Tertiary glow layer
        '0 0', // Enhanced grid pattern
        '0 0', // Crystalline texture
        '0 0', // Fine surface texture
    ].join(','),

    /* Subtle animation properties for dynamic feel */
    transition: 'all 0.3s ease-in-out',

    /* Optional: Add subtle box-shadow for additional depth */
    boxShadow: 'inset 0 0 100px rgba(6, 20, 40, 0.3), inset 0 0 20px rgba(21, 93, 255, 0.1)',
};
export const backgroundClasses = 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-black';
