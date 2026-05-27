import typography from '@tailwindcss/typography'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: ['class', 'class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'DM Sans',
                    ...defaultTheme.fontFamily.sans
                ],
  			mono: [
  				'JetBrains Mono',
                    ...defaultTheme.fontFamily.mono
                ]
  		},
  		colors: {
  			primary: {
  				'50': '#f0fdf4',
  				'100': '#dcfce7',
  				'200': '#bbf7d0',
  				'300': '#86efac',
  				'400': '#4ade80',
  				'500': '#22c55e',
  				'600': '#16a34a',
  				'700': '#15803d',
  				'800': '#166534',
  				'900': '#14532d'
  			},
  			agent: {
  				orchestrator: '#8b5cf6',
  				planner: '#0d9488',
  				researcher: '#f97316',
  				composer: '#ec4899',
  				tutor: '#3b82f6'
  			}
  		},
  		borderRadius: {
  			sm: '6px',
  			md: '10px',
  			lg: '14px',
  			xl: '18px',
  			'2xl': '24px'
  		},
  		boxShadow: {
  			green: '0 4px 14px rgba(34, 197, 94, 0.25)',
  			amber: '0 4px 14px rgba(245, 158, 11, 0.25)',
  			blue: '0 4px 14px rgba(59, 130, 246, 0.25)'
  		},
  		keyframes: {
  			shake: {
  				'0%, 100%': {
  					transform: 'translateX(0)'
  				},
  				'20%': {
  					transform: 'translateX(-6px)'
  				},
  				'40%': {
  					transform: 'translateX(6px)'
  				},
  				'60%': {
  					transform: 'translateX(-4px)'
  				},
  				'80%': {
  					transform: 'translateX(4px)'
  				}
  			},
  			'count-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(8px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			shake: 'shake 0.4s ease',
  			'count-up': 'count-up 0.4s ease',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [typography],
}
