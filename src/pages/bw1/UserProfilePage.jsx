import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import ListingCard from './components/ListingCard';
import SkeletonCard from './components/SkeletonCard';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import AppShell from './components/AppShell';
import * as BrandMod from './content/brand.js';
import * as NavMod from './content/navigation.js';
import { 
  User, 
  Calendar, 
  ShieldCheck,
  BadgeCheck,
  Clock,
  Package,
  ArrowLeft
} from 'lucide-react';

const BRAND = BrandMod.default ?? BrandMod.BRAND;
const NAVIGATION = NavMod.default ?? NavMod.NAVIGATION;

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Buscando perfil do usuário:', userId);
        const response = await api.getProfile(userId);
        console.log('Resposta do perfil:', response);
        setProfile(response.profile);
        setListings(response.listings);
      } catch (err) {
        console.error('Error fetching profile:', err);
        console.error('Error details:', err.response || err.message);
        setError('Erro ao carregar perfil do usuário');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const getMemberDuration = (createdAt) => {
    if (!createdAt) return 'Novo';
    
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 1) return 'Hoje';
    if (days === 1) return '1 dia';
    if (days < 30) return `${days} dias`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? '1 mês' : `${months} meses`;
    }
    const years = Math.floor(days / 365);
    return years === 1 ? '1 ano' : `${years} anos`;
  };

  const getAuthBadge = (authMethod) => {
    const badges = {
      'Google': {
        text: 'Autenticado com Google',
        icon: '🔐',
        color: 'text-blue-600 bg-blue-50'
      },
      'Email': {
        text: 'Autenticado com Email',
        icon: '✉️',
        color: 'text-gray-600 bg-gray-50'
      }
    };
    return badges[authMethod] || badges['Email'];
  };

  const navbar = <Navbar brand={BRAND} navigation={NAVIGATION} />;

  if (loading) {
    return (
      <AppShell header={navbar}>
      <div className="min-h-screen bg-gray-50 pb-24 pt-4">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
          
          {/* Listings Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
      <BottomNav navigation={NAVIGATION} />
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell header={navbar}>
      <div className="min-h-screen bg-gray-50 pb-24 pt-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error || 'Perfil não encontrado'}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
      <BottomNav navigation={NAVIGATION} />
      </AppShell>
    );
  }

  const authBadge = getAuthBadge(profile.auth_method);
  const memberDuration = getMemberDuration(profile.stats.member_since);
  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <AppShell header={navbar}>
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-white/90 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            )}

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-1 truncate">
                {profile.name}
                {isOwnProfile && (
                  <span className="ml-2 text-sm font-normal opacity-90">(Você)</span>
                )}
              </h1>
              <p className="text-white/80 text-sm mb-3 truncate">
                {profile.email}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-2 text-sm">
                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Membro há {memberDuration}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{profile.stats.total_listings} anúncio{profile.stats.total_listings !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Verificações e Segurança
          </h2>
          
          <div className="space-y-3">
            {/* Auth Method */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${authBadge.color} border border-current border-opacity-20`}>
              <span className="text-2xl flex-shrink-0">{authBadge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{authBadge.text}</p>
                <p className="text-xs opacity-75 mt-0.5">Método de autenticação verificado</p>
              </div>
              <BadgeCheck className="w-6 h-6 flex-shrink-0" />
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <Calendar className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Membro desde</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {new Date(profile.stats.member_since).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-500" />
            Anúncios {isOwnProfile ? 'Seus' : `de ${profile.name.split(' ')[0]}`}
          </h2>
          
          {listings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                {isOwnProfile 
                  ? 'Você ainda não tem anúncios ativos' 
                  : 'Este usuário ainda não tem anúncios ativos'}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/criar-anuncio')}
                  className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                  Criar Anúncio
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(listing => (
                <ListingCard key={listing.id} item={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    <BottomNav navigation={NAVIGATION} />
    </AppShell>
  );
};

export default UserProfilePage;
