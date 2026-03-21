<template>
  <div class="min-h-screen bg-background text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed flex items-center justify-center p-6 py-16 relative overflow-hidden">
    <!-- Optional Background Details -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-fixed/20 via-background to-background pointer-events-none"></div>

    <div class="w-full max-w-3xl bg-surface-container-lowest rounded-[3rem] shadow-2xl shadow-primary/5 border border-outline-variant/30 p-10 md:p-14 relative z-10">
      <!-- Decorative element -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-[80px] pointer-events-none"></div>

      <div class="text-center mb-12">
        <span class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-fixed text-primary mb-6 shadow-sm">
          <span class="material-symbols-outlined text-4xl">clinical_notes</span>
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold text-teal-900 font-headline tracking-tighter mb-4">Cadastro de Cuidador</h1>
        <p class="text-lg text-on-surface-variant font-light">Preencha o formulário abaixo para fazer parte da nossa rede exclusiva de cuidadores.</p>
      </div>

      <form class="space-y-8 relative z-10">
        <div class="space-y-2">
          <label class="block text-sm font-bold text-teal-900 ml-1">Nome Completo</label>
          <input type="text" class="block w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-on-surface placeholder:text-outline focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium shadow-inner" placeholder="Ex: Maria da Silva" />
        </div>
        
        <fieldset class="space-y-4 p-6 border border-outline-variant/30 rounded-3xl bg-surface-container-low/50 relative">
          <legend class="text-sm font-bold text-teal-900 px-4 bg-surface-container-lowest rounded-full border border-outline-variant/30 ml-2 py-1 shadow-sm">Gênero</legend>
          <div class="flex flex-wrap gap-8 pl-2">
            <label class="inline-flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="sexo" value="feminino" class="w-5 h-5 text-primary border-outline-variant focus:ring-primary focus:ring-offset-surface-container-lowest cursor-pointer transition-all" />
              <span class="text-on-surface-variant font-medium group-hover:text-teal-900 transition-colors">Feminino</span>
            </label>
            <label class="inline-flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="sexo" value="masculino" class="w-5 h-5 text-primary border-outline-variant focus:ring-primary focus:ring-offset-surface-container-lowest cursor-pointer transition-all" />
              <span class="text-on-surface-variant font-medium group-hover:text-teal-900 transition-colors">Masculino</span>
            </label>
            <label class="inline-flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="sexo" value="outro" class="w-5 h-5 text-primary border-outline-variant focus:ring-primary focus:ring-offset-surface-container-lowest cursor-pointer transition-all" />
              <span class="text-on-surface-variant font-medium group-hover:text-teal-900 transition-colors">Outro</span>
            </label>
          </div>
        </fieldset>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-teal-900 ml-1">Idade</label>
          <input type="tel" class="block w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-on-surface placeholder:text-outline focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium shadow-inner" placeholder="Ex: 35" />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-bold text-teal-900 ml-1">Cursos e experiências</label>
          <textarea rows="4" class="block w-full px-5 py-4 bg-surface-container-low border border-outline-variant/30 rounded-3xl text-on-surface placeholder:text-outline focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium resize-none shadow-inner" placeholder="Conte um pouco sobre os cursos que realizou e sua experiência..."></textarea>
        </div>


        <div class="pt-8 mt-10 border-t border-outline-variant/20 flex justify-end">
          <button type="submit" class="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-container hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all flex items-center justify-center gap-3">
             <span>Enviar Cadastro</span>
             <span class="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}
</style>
