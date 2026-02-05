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
          // Usuário já existe, atualizar avatar se necessário
          if (profile.photos?.[0]?.value && !existingUser.avatar) {
            await supabase
              .from('users')
              .update({ avatar: profile.photos[0].value })
              .eq('id', existingUser.id);
            
            existingUser.avatar = profile.photos[0].value;
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
