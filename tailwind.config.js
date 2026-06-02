import typography from '@tailwindcss/typography'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'Source Serif 4',
  				'Georgia',
  				...defaultTheme.fontFamily.serif
  			],
  			display: ['Caveat', 'cursive'],
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
  			surface: '#FFFBEF'
  		},
  		borderRadius: {
  			sm: '4px',
  			md: '8px',
  			lg: '14px',
  			xl: '18px',
  			'2xl': '24px'
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