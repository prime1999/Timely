import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch } from '@/lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import SubmitButton from '@/lib/utils/SubmitButton';
import { UpdatePasswordRecovery } from '@/lib/slice/AuthSlice';

const Forgotpassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // state for managing password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [searchData, setSearchData] = useState<any>(null);

  const { isLoading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get('userId');
    const secret = queryParams.get('secret');

    setSearchData({ userId, secret });
  }, []);

  // function send the password recovery mail
  const handlePasswordRecovery = async (e: any) => {
    try {
      e.preventDefault();

      //if ie is an email pattern, then
      if (password.length >= 8) {
        const data: any = {
          userId: searchData.userId,
          secret: searchData.secret,
          password,
        };
        // call the dispatch function
        await dispatch(UpdatePasswordRecovery(data)).unwrap();
        toast('Updated password');
        navigate('/signIn');
      } else {
        // if not, then
        console.log('Password must be atleast of 8 characters');
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <main className="w-full h-[100vh] flex items-center justify-center glassmorphism bg-[rgb(255,255,255,0.05)] border-[rgb(234,234,234)] shadow-[0_4px_30px_rgba(80,80,80,0.1)] dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgb(68,68,68)] dark:text-slate-200">
      <form
        className="w-[300px] md:w-[400px]"
        onSubmit={handlePasswordRecovery}
      >
        <div className="flex flex-col gap-4 font-inter">
          <span className="text-sm text-slate-600 font-semibold dark:text-slate-300">
            <p>Enter your new password here</p>
          </span>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-2 right-5 cursor-pointer text-green-400 duration-500 hover:text-green-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <SubmitButton
            isLoading={isLoading}
            disableButton={password === '' ? true : false}
            className="w-full mt-2 bg-green-400 text-black rounded-lg font-inter font-bold"
          >
            Send mail
          </SubmitButton>
        </div>
      </form>
    </main>
  );
};

export default Forgotpassword;
