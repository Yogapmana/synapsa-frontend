import typography from '@tailwindcss/typography'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Source Sans 3',
  				'Inter',
  				'system-ui',
  				'-apple-system',
  				'sans-serif'
  			],
  			display: ['Fraunces', 'Source Serif 4', 'Georgia', 'serif'],
  			serif: ['Source Serif 4', 'Georgia', 'serif'],
  			label: ['Source Sans 3', 'sans-serif'],
  			mono: [
  				'JetBrains Mono',
  				...defaultTheme.fontFamily.mono
  			]
  		},
  		colors: {
  			primary: {
  				DEFAULT: '#22201D',
  				light: '#F7F1E3',
  				dark: '#22201D'
  			},
  			secondary: {
  				DEFAULT: '#7B766D',
  				light: '#A39E94',
  				dark: '#5C5750'
  			},
  			tertiary: {
  				DEFAULT: '#C4251C',
  				light: '#E85D54',
  				dark: '#9A1E16'
  			},
  			neutral: '#F7F1E3',
  			surface: '#FFFBEF',
  			success: {
  				DEFAULT: '#166534',
  				light: '#DCFCE7',
  				fg: '#166534'
  			},
  			warning: {
  				DEFAULT: '#A16207',
  				light: '#FEF3C7',
  				fg: '#A16207'
  			},
  			info: {
  				DEFAULT: '#1D4ED8',
  				light: '#DBEAFE',
  				fg: '#1D4ED8'
  			},
  			danger: {
  				DEFAULT: '#C4251C',
  				light: '#FEE2E2',
  				fg: '#991B1B'
  			}
  		},
  		borderRadius: {
  			sm: '4px',
  			md: '8px',
  			lg: '14px',
  			xl: '18px',
  			'2xl': '24px'
  		},
  		boxShadow: {
  			'warm-xs': '0 1px 2px rgba(58, 41, 22, 0.05)',
  			'warm-sm': '0 1px 3px rgba(58, 41, 22, 0.08), 0 1px 2px rgba(58, 41, 22, 0.04)',
  			'warm-md': '0 4px 6px -1px rgba(58, 41, 22, 0.08), 0 2px 4px -2px rgba(58, 41, 22, 0.06)',
  			'warm-lg': '0 10px 15px -3px rgba(58, 41, 22, 0.10), 0 4px 6px -4px rgba(58, 41, 22, 0.06)',
  			'warm-xl': '0 20px 25px -5px rgba(58, 41, 22, 0.12), 0 8px 10px -6px rgba(58, 41, 22, 0.08)',
  			'glow-tertiary': '0 0 0 4px rgba(196, 37, 28, 0.12)'
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
  			},
  			'fade-in-up': {
  				from: { opacity: '0', transform: 'translateY(8px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'pulse-soft': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.6' }
  			},
  			'shimmer': {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' }
  			}
  		},
  		animation: {
  			shake: 'shake 0.4s ease',
  			'count-up': 'count-up 0.4s ease',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			shimmer: 'shimmer 2s linear infinite'
  		}
  	}
  },
  plugins: [typography],
}