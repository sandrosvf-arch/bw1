import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { supabase } from './supabase';

// Configurar estratégia do Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        // Buscar usuário pelo email do Google
        const { data: existingUser, error: searchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', profile.emails?.[0].value)
          .single();

        if (existingUser) {
          // Usuário já existe, atualizar avatar e auth_provider se necessário
          const updates: any = {};
          
          if (profile.photos?.[0]?.value && !existingUser.avatar) {
            updates.avatar = profile.photos[0].value;
          }
          
          // Garantir que auth_provider está definido
          if (!existingUser.auth_provider || existingUser.auth_provider === 'email') {
            updates.auth_provider = 'google';
          }
          
          if (Object.keys(updates).length > 0) {
            await supabase
              .from('users')
              .update(updates)
              .eq('id', existingUser.id);
            
            Object.assign(existingUser, updates);
          }
          
          return done(null, existingUser);
        }

        // Criar novo usuário
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: profile.emails?.[0].value,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            password: '', // Senha vazia para usuários OAuth
            auth_provider: 'google',
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
