import LoginForm from '../../../components/admin/LoginForm';

// Reads the environment at request time, so enabling two-step sign-in needs no rebuild.
export const dynamic = 'force-dynamic';

export default function LoginPage() {
   return <LoginForm needsCode={Boolean(process.env.ADMIN_TOTP_SECRET)} />;
}
