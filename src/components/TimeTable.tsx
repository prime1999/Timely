import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';
import { MdAdsClick } from 'react-icons/md';
import { FaBookOpen } from 'react-icons/fa';
import { AppDispatch } from '@/lib/store';
import { findUnRegisteredCourses } from '@/lib/slice/CourseSlice';
import CourseDetail from './modals/CourseDetail';
import TableLoader from '@/lib/utils/tableLoader';
import {
  getDuration,
  getToday,
} from '@/lib/utils/helperFunctions/TimeFormater';
import FindCourses from './FindCourses';
import ShowUnregisteredCourses from './modals/ShowUnregisteredCourses';
import MinLoader from '@/lib/utils/MinLoader';

const TimeTable = () => {
  // state for the selected course
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [showCourseDetails, setShowCourseDetails] = useState<boolean>(false);
  // modal state to show unreistered related courses
  const [open, setOpen] = useState<boolean>(false);
  // init the dispatch
  const dispatch = useDispatch<AppDispatch>();
  // state for the course state selection from the store
  const { isLoading, data, unRegisteredCourses, loadingCourses } = useSelector(
    (state: any) => state.course
  );

  // function to find unregistered courses related to the current student
  const handleFindCourse = useCallback(async () => {
    try {
      console.log(123);
      const courses = await dispatch(findUnRegisteredCourses()).unwrap();
      if (courses && courses.courses.length > 0) {
        setOpen(true);
      }
      toast(courses.msg);
    } catch (error) {
      console.log(error);
    }
  }, [isLoading]);

  return (
    <main className="w-full glassmorphism bg-[rgb(255,255,255,0.05)] border-[rgb(234,234,234)] shadow-[0_4px_30px_rgba(80,80,80,0.1)] border-1 rounded-md p-4 mt-4 dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgb(68,68,68)] dark:text-slate-400">
      <h3 className="font-inter font-bold p-2 text-gray-600 uppercase dark:text-slate-400">
        Your Time-Table
      </h3>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <TableLoader />
        </div>
      ) : data && Array.isArray(data) && data.length > 0 && !isLoading ? (
        <div>
          {data?.map((course: any, i: number) => (
            <div
              key={i}
              className="relative w-full font-inter text-xs capitalize mt-4 bg-white shadow-md p-4 rounded-md dark:bg-gray-900 dark:shadow-gray-600"
            >
              <div className="w-full flex items-center gap-8 justify-between">
                <div className="w-4/12 h-full flex gap-2 items-center">
                  <span
                    className={`h-[32px] flex justify-center items-center p-2 ${
                      course.unit === '4'
                        ? 'bg-green-300'
                        : course.unit === '3'
                        ? 'bg-purple-300'
                        : course.unit === '2'
                        ? 'bg-yellow-200'
                        : 'bg-red-300'
                    }`}
                  >
                    <FaBookOpen className="text-md dark:text-slate-800" />
                  </span>
                  <div className="w-full flex flex-col">
                    <p className="text-[15px] truncate dark:text-slate-200">
                      {course.CourseTitle}
                    </p>
                    <span className="w-30 flex gap-2 items-center text-xs text-gray-500 pt-1 dark:text-gray-400 lg:w-68">
                      {course.CourseCode && (
                        <>
                          <p>{course.CourseCode}</p>
                          <span className="bg-gray-500 w-1 h-1 rounded-full dark:bg-gray-600"></span>
                        </>
                      )}
                      <p>
                        {course.unit} {course.unit === '1' ? 'unit' : 'units'}
                      </p>

                      {course.lecturer && (
                        <>
                          <span className="hidden bg-gray-500 w-1 h-1 rounded-full dark:bg-gray-600 lg:block"></span>
                          <p className="hidden lg:block">{course.lecturer}</p>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-end items-center">
                  <h6 className="text-xs mb-2 font-semibold text-gray-500 dark:text-gray-400">
                    Full Schedule
                  </h6>
                  <button
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowCourseDetails(true);
                    }}
                    className="text-sm bg-green-400 rounded-full p-2 cursor-pointer duration-500 hover:bg-green-500"
                  >
                    <MdAdsClick className="tetx-sm dark:text-slate-200" />
                  </button>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-semibold  text-gray-500 dark:text-gray-400">
                    {getToday()}
                  </p>
                  {JSON.parse(course.schedule).map((time: any, i: number) => (
                    <span key={i} className="flex mb-2">
                      {time.day.toLowerCase() === getToday().toLowerCase() ? (
                        <p className="text-gray-500 dark:text-gray-400">
                          {getDuration(time.startDate, time.endDate)}
                        </p>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">Free</p>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              {showCourseDetails && (
                <CourseDetail
                  selectedCourse={selectedCourse}
                  showCourseDetails={showCourseDetails}
                  setShowCourseDetails={setShowCourseDetails}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleFindCourse()}
              className="flex items-center justify-center w-24 text-sm font-semibold p-2 rounded-md bg-green-500 cursor-pointer duration-700 hover:bg-green-600 dark:text-slate-200"
            >
              {loadingCourses ? <MinLoader /> : 'Find'}
            </button>
          </div>
        </div>
      ) : (
        <FindCourses handleFindCourse={handleFindCourse} />
      )}
      <ShowUnregisteredCourses
        courses={unRegisteredCourses}
        open={open}
        setOpen={setOpen}
      />
      <Toaster />
    </main>
  );
};

export default TimeTable;
