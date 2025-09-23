import { useEffect, useState } from 'react';
import { AppDispatch } from '@/lib/store';
import { useDispatch, useSelector } from 'react-redux';
import { getClashedCourses } from '@/lib/slice/CourseSlice';
import ClashedCourseModal from './modals/ClashedCourseModal';

const ClashedCourses = () => {
  const dispatch = useDispatch<AppDispatch>();
  // state to control the modal for showing the clashed courses
  const [open, setOpen] = useState<boolean>(false);
  // state for the course state selection from the store
  const { reload, clashedCourses, data } = useSelector(
    (state: any) => state.course
  );
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      dispatch(getClashedCourses(data));
    }
  }, [reload, dispatch, data]);

  return (
    <main className="font-inter text-sm mb-8 w-full py-8 px-4 tracking-wide text-gray-800 rounded-md dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgb(68,68,68)] dark:text-slate-400 lg:h-48 lg:gap-4">
      <h2 className="font-semibold">
        {clashedCourses && clashedCourses.length > 0 ? (
          <>
            <span
              className="flex items-center justify-between bg-muted mb-2 after:bg-red-500
									 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full dark: dark:bg-[rgb(255,255,255,0.05)]"
            >
              Your have some courses on your time-table that are clashing with
              each other
            </span>
            <button
              onClick={() => setOpen(true)}
              className="w-full flex items-center justify-center mx-auto bg-green-400 p-2 rounded-md mt-4 cursor-pointer duration-700 hover:bg-green-500 text-gray-800 dark:text-slate-200"
            >
              Check
            </button>
          </>
        ) : (
          <span
            className="flex items-center justify-between bg-muted mb-2 after:bg-green-500
									 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full dark: dark:bg-[rgb(255,255,255,0.05)]"
          >
            None of your courses schedules are clashing
          </span>
        )}
      </h2>
      {open && <ClashedCourseModal open={open} setOpen={setOpen} />}
    </main>
  );
};

export default ClashedCourses;
