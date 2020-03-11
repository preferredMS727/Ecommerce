import { Component, OnInit } from '@angular/core';
import { AuthNoticeService, AuthService, Register, User } from '../../../../core/auth/';
import { FireAuthService } from '../../../../core/auth/_services/fire-auth.service';
@Component({
  selector: 'kt-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  userEmail: string;

  constructor(
    public fireAuthService: FireAuthService,
    private authNoticeService: AuthNoticeService,
  ) { }

  ngOnInit() {
    this.userEmail = JSON.parse(localStorage.getItem('user')).email;
  }

  ngOnDestroy(): void {
		// this.unsubscribe.next();
		// this.unsubscribe.complete();
		// this.loading = false;
		this.authNoticeService.setNotice(null);
	}

  resendVerifyEmail() {
    this.fireAuthService.sendVerificationMail()
      .then((res) => {
        console.log('verify email is resent')
        this.authNoticeService.setNotice('Verify email is resent');
      })
  }

}
