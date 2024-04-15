import { Router } from "express";
import * as controller from '../controllers/appController.js';

const router = Router();

router.route('/login').post(controller.login);


 router.post('/signup', controller.signup);


router.post('/generate-otp', controller.createOTP);
router.route('/validate-otp-and-register').post(controller.validateOTPAndRegister);

router.post('/send-mail', controller.sendOTPEmail);
router.get('/user', controller.getUser);

export default router;
