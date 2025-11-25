import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import { Link } from "react-router-dom";
import ptTranslations from "@/i18n/locales/pt";
import enTranslations from "@/i18n/locales/en";

const SaibaMais = () => {
  const { t, language } = useI18n();
  const translations = language === 'pt' ? ptTranslations : enTranslations;
  const about = translations.about;

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Header onOpenSidebar={undefined} showSidebarButton={undefined} showPromoBanner={false} />
      <div style={{ height: 80 }} />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 px-6 md:px-12 border-b border-gray-900">
          <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
            <div className="col-span-12 opacity-20 bg-gradient-to-b from-transparent to-black" />
          </div>

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 mb-6 text-white/60 text-sm uppercase tracking-wider">
              <div className="w-12 h-px bg-white/20"></div>
              <span>{t('about.tagline')}</span>
              <div className="w-12 h-px bg-white/20"></div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-extrabold text-5xl md:text-6xl leading-tight tracking-tight mb-6">
              {t('about.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              {t('about.subtitle')}
            </motion.p>

            {/* Subtle radial glow */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 w-[420px] h-[420px] rounded-full mix-blend-screen opacity-10 pointer-events-none" style={{background: 'radial-gradient(closest-side,#ffffff,transparent)'}} />
          </div>
        </section>

        {/* Main Content */}
        <section className="py-32 px-6 md:px-12 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 space-y-32">
            {/* Section 1: Filosofia */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-10 lg:p-16 overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                      <Icon name="owl" size={40} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {t('about.philosophy.title')}
                    </h2>
                  </div>
                  
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-4xl">
                    {t('about.philosophy.description')}
                  </p>

                  {/* Points Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mt-8">
                    {about.philosophy.points.map((point: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-base leading-relaxed">{point}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 2: Desenvolvimento */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-10 lg:p-16 overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                      <Icon name="rocket-launch" size={40} />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {t('about.development.title')}
                      </h2>
                      <p className="text-gray-400 text-base">
                        {t('about.development.subtitle')}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-4xl">
                    {t('about.development.description')}
                  </p>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {about.development.features.map((feature: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-6 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                      >
                        <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 3: Missão */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-10 lg:p-16 overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                      <Icon name="workspace-premium" size={40} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {t('about.mission.title')}
                    </h2>
                  </div>
                  
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-4xl">
                    {t('about.mission.description')}
                  </p>

                  {/* Goals and Values */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Goals */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6">{t('about.mission.goalsTitle')}</h3>
                      <div className="space-y-3">
                        {about.mission.goals.map((goal: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-white/5 rounded-lg"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 flex-shrink-0"></div>
                            <p className="text-gray-300 text-sm leading-relaxed">{goal}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Values */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-6">{t('about.mission.valuesTitle')}</h3>
                      <div className="space-y-4">
                        {about.mission.values.map((value: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-4 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-white/10 transition-colors"
                          >
                            <h4 className="text-base font-semibold text-white mb-2">{value.title}</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">{value.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 4: Infraestrutura */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-10 lg:p-16 overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                      <Icon name="monitoring-chart" size={40} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {t('about.infrastructure.title')}
                    </h2>
                  </div>
                  
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-4xl">
                    {t('about.infrastructure.description')}
                  </p>

                  {/* Components Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {about.infrastructure.components.map((component: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-6 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                      >
                        <h3 className="text-xl font-semibold text-white mb-3">{component.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">{component.description}</p>
                        <ul className="space-y-2">
                          {component.details.map((detail: string, detailIndex: number) => (
                            <li key={detailIndex} className="flex items-start gap-2 text-gray-400 text-xs">
                              <span className="text-white mt-1.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 5: Tecnologia */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-10 lg:p-16 overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                      <Icon name="precision-manufacturing" size={40} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {t('about.technology.title')}
                    </h2>
                  </div>
                  
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-4xl">
                    {t('about.technology.description')}
                  </p>

                  {/* Technology Stack */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {about.technology.stack.map((tech: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-6 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-white mb-2">{tech.category}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">{tech.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {tech.technologies.map((technology: string, techIndex: number) => (
                            <span key={techIndex} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-gray-300">
                              {technology}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 6: Funcionalidades */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-10 lg:p-16 overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {t('about.features.title')}
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                      {t('about.features.description')}
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {about.features.list.map((feature: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="p-6 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors group/item"
                      >
                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/5 border border-white/10 group-hover/item:bg-white/10 group-hover/item:border-white/20 transition-all duration-300">
                          <Icon name={feature.icon} size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 7: Benefícios */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-10 lg:p-16 overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {t('about.benefits.title')}
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                      {t('about.benefits.description')}
                    </p>
                  </div>

                  {/* Benefits Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {about.benefits.items.map((benefit: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="p-6 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-white mb-3">{benefit.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{benefit.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 8: Visão */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="group relative"
            >
              <div className="relative bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-10 lg:p-16 overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-white/10 transition-all duration-700"></div>
                
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                  <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                    <Icon name="precision-manufacturing" size={40} />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    {t('about.vision.title')}
                  </h2>
                  
                  <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10">
                    {t('about.vision.description')}
                  </p>
                  
                  <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed mb-10">
                    {t('about.vision.tagline')}
                  </p>

                  {/* Future Goals */}
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    {about.vision.future.map((goal: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-[#0a0a0a] border border-white/5 rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-white mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm leading-relaxed">{goal}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Decorative line */}
                  <div className="mt-10 flex justify-center">
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#050505] border border-white/10 rounded-3xl p-12">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {t('about.cta.learnMore')}
                </h3>
                <div className="inline-flex flex-col sm:flex-row items-center gap-4 mt-6">
                  <Link
                    to="/plans"
                    className="bg-white text-black px-8 py-4 rounded-full font-semibold shadow-sm smooth-hover scale-in inline-flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Icon name="rocket-launch" size={20} />
                    {t('about.cta.start')}
                  </Link>
                  <Link
                    to="/"
                    className="text-gray-300 flex items-center gap-2 smooth-hover hover:text-white transition-colors"
                  >
                    {t('about.cta.back')} →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SaibaMais;
