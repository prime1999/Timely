import { Databases, ID, Query } from 'appwrite';
import client from '../appwrite.config';
import {
  COURSES_ID,
  DBID,
  STUDENTID,
  TIME_TABLE_ID,
  USER_COURSE_ID,
} from '@/contants/env.file';
import { checkCurrentSession } from './Student.actions';

const databases = new Databases(client);

// Appwrite function to check the time-table in the DB
export const checkAppriteTimeTable = async (type: string) => {
  try {
    // get the current user
    const user: any = await checkCurrentSession();
    if (!user) return 'User not Authorized';
    // get the user's doc
    const student = await databases.getDocument(DBID, STUDENTID, user.$id);
    // check the DB for timetables based on the users faculty
    const res = await databases.listDocuments(DBID, TIME_TABLE_ID, [
      Query.equal('type', type),
      Query.equal(
        'part',
        type === 'faculty' ? student.faculty : student.department
      ),
    ]);
    return res;
  } catch (error) {
    console.log(error);
  }
};

// Appwrite function to create a new faculty timeTable in the DB
export const createAppwritTimeTable = async (data: string) => {
  try {
    // get the current user
    const user: any = await checkCurrentSession();
    if (!user) return 'User not Authorized';
    // get the user's doc
    const student = await databases.getDocument(DBID, STUDENTID, user.$id);
    const dataToSent = {
      type: 'faculty',
      part: student.faculty,
      level: student.level,
      uploadedBy: user.$id,
      table: JSON.stringify(data),
    };
    // create the timetable for the faculty
    const res = await databases.createDocument(
      DBID,
      TIME_TABLE_ID,
      ID.unique(),
      dataToSent
    );
    if (res) return res;
  } catch (error) {
    console.log(error);
  }
};

// Appwrite function to update a time table doc in the DB
export const updateAppwriteTimeTable = async (data: any) => {
  try {
    // get the current user
    const user: any = await checkCurrentSession();
    if (!user) return 'User not Authorized';
    // get the user's doc
    const student = await databases.getDocument(DBID, STUDENTID, user.$id);
    // get the timetable's doc
    const timetable = await databases.listDocuments(DBID, TIME_TABLE_ID, [
      Query.equal('type', data.type === 'faculty' ? 'faculty' : 'department'),
      Query.equal('part', student.faculty),
      Query.equal('level', student.level),
    ]);
    if (timetable && timetable.total < 1) return 'No document found';
    // create the timetable for the faculty
    const res = await databases.updateDocument(
      DBID,
      TIME_TABLE_ID,
      timetable.documents[0].$id,
      {
        table: JSON.stringify(data.payload),
      }
    );
    if (res) return res;
  } catch (error) {
    console.log(error);
  }
};

// Appwrite function to finc te related unregistered courses for the user
export const findUnRegisteredCouresInDB = async () => {
  try {
    console.log(123);
    // get the current user
    const user: any = await checkCurrentSession();
    if (!user) return 'User not Authorized';
    // get the user document details
    const student = await databases.getDocument(DBID, STUDENTID, user.$id);
    // if the student does not have a document details
    if (!student || !student.$id) return 'User not Authenticated';
    // if the student details was gotten
    // find the students that share the same department and level has the current student
    const mates = await databases.listDocuments(DBID, STUDENTID, [
      Query.equal('department', student.department),
      Query.equal('level', student.level),
    ]);
    console.log(mates);
    // filter out the current user
    const courseMates: any = await mates.documents.filter(
      (mate) => mate.$id !== user.$id
    );
    //  if the student does not have any course mates
    if (courseMates.length < 1) {
      return {
        msg: 'Course mates are yet to register for any course on the app',
        courses: [],
      };
    }
    // but if the courses mates have registered
    // now loop through them to get the course they registerd for
    const matesRegisteredCourses = await Promise.all(
      courseMates.map(async (user: any) => {
        const userCourses = await databases.listDocuments(
          DBID,
          USER_COURSE_ID,
          [Query.equal('userId', user.$id)]
        );
        // Return only if the user has courses
        if (userCourses.total > 0) {
          return userCourses;
        } else {
          // Return null for users with no courses
          return null;
        }
      })
    );
    console.log(matesRegisteredCourses);
    // Filter out the null values (users with no courses)
    const matesCourses: any = matesRegisteredCourses.filter(
      (course) => course !== null
    );
    if (matesCourses.length < 1)
      return {
        msg: 'Course mates are yet to register for any course on the app',
        courses: [],
      };
    // loop through course mates array, for each one that the documents is not empty
    // the code will get there documents and add to general array (loopedMatesCourses)
    const loopedMatesCourses: any[] = [];
    matesCourses.forEach((course: any) => {
      if (course.total > 0) {
        course.documents.forEach((list: any) => {
          // make sure the course doesn't repeat themselves
          if (!loopedMatesCourses.some((c) => c.courseId === list.courseId)) {
            loopedMatesCourses.push(list);
          }
        });
      }
    });
    console.log(loopedMatesCourses);
    // if the looped array is empty
    if (loopedMatesCourses.length < 1) return;
    // loop through them again to get the one the user is not registered for
    const currentStudentRegisteredCourses = await Promise.all(
      loopedMatesCourses.map(async (course: any) => {
        const userCourses = await databases.listDocuments(
          DBID,
          USER_COURSE_ID,
          [
            Query.equal('courseId', course.courseId),
            Query.equal('userId', user.$id),
          ]
        );
        console.log(userCourses);
        // Return only if the user has courses
        if (userCourses.total === 0) {
          console.log(course);
          return course;
        } else {
          // Return this object for users with no courses
          return null;
        }
      })
    );

    // Filter out the null values (non-existing courses)
    const filterCurrentStudentRegisteredCourses: any =
      currentStudentRegisteredCourses.filter((course) => course !== null);
    // now get the courses details of the ones that are registered
    console.log(filterCurrentStudentRegisteredCourses);
    const registeredCourseDetails = await Promise.all(
      filterCurrentStudentRegisteredCourses.map(async (list: any) => {
        console.log(list);
        const coursesDetail = await databases.getDocument(
          DBID,
          COURSES_ID,
          list.courseId
        );
        // Return only if the courses actually exist in the DB
        if (coursesDetail && coursesDetail.$id) {
          return coursesDetail;
        } else {
          // Return null if not
          return null;
        }
      })
    );

    // Filter out the null values (non-existing courses)
    const existingCourses: any = registeredCourseDetails.filter(
      (course) => course !== null
    );
    if (existingCourses.length < 1)
      return {
        msg: 'Course mates are yet to register for any other courses on the app',
        courses: [],
      };
    return { msg: 'Register', courses: existingCourses };
  } catch (error) {
    console.log(error);
  }
};
