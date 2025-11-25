import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '3rem',
			screens: {
				'2xl': '1600px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
				'space-grotesk': ['Space Grotesk', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
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
				'fadeIn': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fadeInUp': {
					from: { opacity: '0', transform: 'translateY(30px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slideInLeft': {
					from: { opacity: '0', transform: 'translateX(-50px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'slideInRight': {
					from: { opacity: '0', transform: 'translateX(50px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'scaleIn': {
					from: { opacity: '0', transform: 'scale(0.9)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'textReveal': {
					from: { opacity: '0', transform: 'translateY(30px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'textGlow': {
					'0%, 100%': { textShadow: '0 0 5px rgba(255, 255, 255, 0.2)' },
					'50%': { textShadow: '0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'cascadeIn': {
					from: { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
					to: { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'toastSlideIn': {
					from: { 
						opacity: '0', 
						transform: 'translateY(-20px) scale(0.95)',
					},
					to: { 
						opacity: '1', 
						transform: 'translateY(0) scale(1)',
					}
				},
				'toastSlideOut': {
					from: { 
						opacity: '1', 
						transform: 'translateY(0) scale(1)',
					},
					to: { 
						opacity: '0', 
						transform: 'translateY(-10px) scale(0.95)',
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-left': 'slideInLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-in-right': 'slideInRight 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'text-reveal': 'textReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
				'text-glow': 'textGlow 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'cascade-in': 'cascadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'toast-slide-in': 'toastSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
				'toast-slide-out': 'toastSlideOut 0.4s cubic-bezier(0.4, 0, 1, 1)'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
